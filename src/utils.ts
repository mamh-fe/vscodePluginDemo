const path = require('path');
const fs = require("fs");
var readline = require('readline');

interface objItem {
    key: string, 
    value: string,
    difference ?: number
}

let vContentList : Array<objItem>;
const nameList = ['.less', '.scss', '.sass'];
const excludeFiles = ['static','node_modules','build','public'];

/**存储所有less, saas, scss 文件中以'@'开头的内容, 数组格式 */
export function saveContent(list: Array<any>) {
    vContentList = list;
}

export function getContent() {
    return vContentList;
}

/**需要监听的文件后缀名 */
export const extnameList = nameList;

// 查找less, scss, sass 文件
export function walk(dir: String) {
    let results: Array<string> = []
    var list = fs.readdirSync(dir);
    list.forEach((file: string) => {
        // 排除static静态目录  node_modules build
        if (excludeFiles.includes(file)) {
            return false
        }
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file))
        } else {
            // 过滤后缀名
            const extname = path.extname(file);
            if (nameList.includes(extname)) {
                results.push(path.resolve(__dirname, file))
            }
        }
    })
    return results
}

// 按行读取文件内容解析
export async function dealScriOnLine(fileList:Array<string>) {
    const arr = new Array();
    fileList.forEach((filePath:string) => {
        const fRead = fs.createReadStream(filePath);
        const objReadline = readline.createInterface({
            input:fRead
        });
        objReadline.on('line',function (line:any) {
            const regex=/^@.*;$/;
            line.trim();
            if(regex.test(line) && !line.includes('import')) {
                const singleLine = line.split(':');
                const obj: objItem = {
                    key: singleLine[0].trim(),
                    value: singleLine[1].trim()
                }
                arr.push(obj);
            }
        });
        objReadline.on('close',function () {
            saveContent(arr);
        });
   });
}

/* 读取文件内容*/
export function dealScri(fileList:Array<string>) {
    let fcontent = '';
    fileList.forEach((filepath, index) => {
        fcontent += fs.readFileSync(filepath, 'utf-8');
    });
    return fcontent;
}

// 去掉换行去掉空格
export function ClearBr(key:string): string {
    key = key.replace(/(\/\/.*)|(\/\*[\s\S]*?\*\/)/g, '');
    key = key.replace(/[\r\n]/g, ""); 
    return key;
}

/**
 * 16进制色值转rgb格式（不含透明度）
 * @param colorStr 
 */

export function colorToRGB(val: string) {

    const pattern = /^(#?)[a-fA-F0-9]{6}$/; //16进制颜色值校验规则

    if (!pattern.test(val)) { //如果值不符合规则返回空字符
        return '';
    }

    let v = val.replace(/#/, ''); //如果有#号先去除#号
    let rgbArr = [];
    let rgbStr = '';

    for (let i=0; i<3; i++) {
        let item = v.substring(i*2, i*2+2);
        // 每两位转成10进制, 合起来便是rgb的三位
        let num = parseInt(item, 16);
        rgbArr.push(num);
    } 
    
    rgbStr = rgbArr.join();
    rgbStr = 'rgb' + '(' + rgbStr + ')';
    return rgbStr;
}

// 同步遍历
export function fileDisplay(filePath:string){
    let fileList: string[] = [];

    //根据文件路径读取文件，返回文件列表
    var list = fs.readdirSync(filePath);
    list.forEach( (ele: string) => {
        var info = fs.statSync(filePath + "/" + ele);	
        if(info.isDirectory()){
            fileDisplay(filePath + "/" + ele);
        }else{
            fileList.push(filePath + "/" + ele);
        }
    })
    return fileList;
}

/**
 * 取出mix（）函数的三个参数
 * @param value
 */

export function handleMixParams(val: string) {
    // val "mix(@color-white, @color-success, 30%) ";
    // 先取出（）内的，载转成数组
    const beginIndex = val.indexOf('(');
    const endIndex = val.indexOf(')');
    const paramsStr = val.slice(beginIndex+1, endIndex);
    // paramsStr : "@color-white, @color-success, 30%"
    return paramsStr.split(',');
}

/**
     * 计算mix后的色值
     * @param mixParamsArr 
     * @param variableArr
     *  mixParams : ["@color-white", " @color-success", " 30%"] => 可能每项有空格
     * variableArr 结构
     * [{
            key: '@color-black',
            value: '#000'
        },{
            key: '@color-primary-light-8',
            value: 'mix(@color-white, @color-primary, 80%) '
        }]
     */

export function handleMixColor(mixParams: string[], variableArr: any[]) {
    const getColor = (colorV: string) => {
        let c: string = '';
        variableArr.forEach((item: objItem) => {
            if(item.key === colorV) c = item.value;
        })
        return c.replace(/(^\s*)|(\s*$)/g, "");
    }

    const params0 = mixParams[0].replace(/(^\s*)|(\s*$)/g, "");
    const params1 = mixParams[1].replace(/(^\s*)|(\s*$)/g, "");
    const params2 = mixParams[2].replace(/(^\s*)|(\s*$)/g, "");

    // 如果前两个参数不是色值, 则查找该变量色值
    const color1 = params0.startsWith('#') ? params0 : getColor(params0);
    const color2 = params1.startsWith('#') ? params1 : getColor(params1);
    const alpha = +params2.substring(0,params2.length-1)/100;
    
    // color1 #fff color2 #ff9b2a
    // 如果是3位补充为6位
    const c1 = color1.slice(1).length === 3 ? color1.slice(1)+color1.slice(1) : color1.slice(1);
    const c2 = color2.slice(1).length === 3 ? color2.slice(1)+color2.slice(1) : color2.slice(1);

    // 将 color1 和 color2 分别转成 rgb格式，然后进行计算 
    // 为了方便， 省略转成rgb的过程， 直接对应将16进制的每两位转成R，G，B， 然后将color1 与color2的对应位分别*alpha, (1-alpha),然后相加， 得到最终的R，G，B
    const resultR = parseInt(c1.slice(0, 2), 16) * alpha + parseInt(c2.slice(0, 2), 16) * (1-alpha);
    const resultG = parseInt(c1.slice(2, 4), 16) * alpha + parseInt(c2.slice(2, 4), 16) * (1-alpha);
    const resultB = parseInt(c1.slice(4, 6), 16) * alpha + parseInt(c2.slice(4, 6), 16) * (1-alpha);
    // 最终 rgb(Math.round(resultR), Math.round(resultG), Math.round(resultB));

    // 将最终的rgb各种转回城16进制
    const result16Color = (Math.round(resultR)).toString(16) + (Math.round(resultG)).toString(16) + (Math.round(resultB)).toString(16);
    // result16Color -> ffffff,
    return result16Color;
}
