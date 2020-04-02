const _ = require('lodash');
import { handleMixParams, handleMixColor, getContent} from './utils';

interface objItem {
    key: string, 
    value: string,
    difference: number
}

interface statsObj {
    isFile: Function,
    isDirectory: Function
}

export class RProcess {

    // constructor(public variableList: Array<any>) {}
    constructor() {}

    private reColorReg: RegExp =/^#([0-9a-fA-F]+)$/g;
    private pxReg: RegExp = /(^\d+(\.\d+)?)(px)?/;
    /**如果开始取了不能更新到最新的值， 所以要使用的时候去取 */
    // private variableList: Array<any> = getContent();

    /**
     * transform color/ px to variable
     *
     * @param {string} code origin text
     * @return {string} transformed text
     */
    convert(text: string) {
        let matchColor = this.reColorReg.test(text);
        let matchPx = this.pxReg.test(text);
        if(!matchColor && !matchPx ) return null;
        if(matchPx) {
            return this.toPxVariable(text, getContent());
        }
 
        // if(matchColor) {
        //     return this.toColorVariable(text, this.variableList);
        // }else {
        //     return this.toPxVariable(text, this.variableList);
        // }
    }

     /**
     * transform colorStr value to colorVariable
     *
     * @param {string} colorStr px value
     * @return {Object} transformed object
     *  variableArr 结构
        [{
            key: '@color-black',
            value: '#000'
        },{
            key: '@color-primary-light-8',
            value: 'mix(@color-white, @color-primary, 80%) '
        }]
     */
    private toColorVariable(colorStr: string, variableArr: any[]) {

        // 查找相近色值, 先将16进制转成10进制进行比较
        // 如果色值是三位先将其补充为6位
        // 将形如 #123123 的# 去掉
        const cStr = colorStr.slice(1);
        const tenColorStr = cStr.length === 3 ? parseInt((cStr+colorStr), 16) : parseInt(cStr, 16);
        // 去掉px 变量
        let newAriableArr = _.filter(variableArr, (item : objItem) => item.value && item.value.indexOf('px') == -1) ;
        newAriableArr.forEach((item: any) => {
            // 计算和输入值的差值
            if(!item.value) return;
            let reV = item.value.replace(/(^\s*)|(\s*$)/g, "");
            if(reV.startsWith('#')) {
                const sItem = reV.slice(1);
                // 如果value直接定义的是色值
                const tensItem = parseInt(sItem, 16);
                item.difference = Math.abs(tenColorStr-tensItem);
            }

            if(reV.startsWith('mix')) {
                // 如果值是mix混入， 则需要将mix混合后的值计算出来， 具体计算步骤见最下边例子
                // 取出mix的三个变量， color1, color2, a;
                const mixParams = handleMixParams(item.value);
                // mixParams : ["@color-white", " @color-success", " 30%"] => 可能每项有空格
                // 计算mix后得到的最终色值 16进制
                const result16Color = handleMixColor(mixParams, newAriableArr);
                // 将最终得到的色值与传入的进行差值比对
                const tensItem = parseInt(result16Color, 16);
                item.difference = Math.abs(tenColorStr-tensItem);
            }

            // 变量引用变量值的情况
            if(reV.startsWith('@')) {
                let v = '';
                newAriableArr.forEach((ele: any) => {
                    if(reV === ele.key) {
                        v = ele.value;
                    }
                })
                const sItem = v.slice(1).replace(/(^\s*)|(\s*$)/g, "");
                // 如果value直接定义的是色值
                const tensItem = parseInt(sItem, 16);
                item.difference = Math.abs(tenColorStr-tensItem);
            }
            
        })

        const sortVariableArr = _.sortBy(newAriableArr, 'difference');

        // sortText 排序是根据string 类型进行的排序， 所以之前计算的difference 不起作用， 则从新整理用字符串排序，
        _.each(newAriableArr, (v: any, index:number) => v.sortIndex = String(1) + Array(index+1).fill(1).join(''));

        return {preValue: `${colorStr}`, variableList: sortVariableArr};
    }

    // px 转变量
    private toPxVariable(pxString: string, variableArr: any[] = []) {
        let pxS = pxString.replace('px', '');
        let pxArr:object[] = [];
        variableArr.forEach(item => {
            if(!item.value) return;
            let reV = item.value;
            // 找出px的变量 TODO: 目前先找一层的px， 以后还需要扩展计算， 取值等情况
            if(reV.endsWith('px;')) {
                let val = reV.replace('px;', '');
                item.difference = Math.abs(parseFloat(val) - parseFloat(pxS));
                pxArr.push(item);
            }
        })
        const sortVariableArr = _.sortBy(pxArr, 'difference');
        // sortText 排序是根据string 类型进行的排序， 所以之前计算的difference 不起作用， 则从新整理用字符串排序，
        _.each(sortVariableArr, (v: any, index:number) => v.sortIndex = String(1) + Array(index+1).fill(1).join(''));
        return {preValue: `${pxString}`, variableList: sortVariableArr};
    }
}


// @color-primary-light-1: mix(#fff, #ff9b2a, 10%) => #ffa53f
/** 
 * 计算方法 (即16进制的每两位对应R, G, B, 比例求职即可得到混合后的rgb)
 * 16进制转成10进制, rgb格式
 * parseInt('ff', 16) = 255
 * parseInt('9b', 16) = 155
 * parseInt('2a', 16) = 42
 * 
 * mix(rgb(255, 255, 255), rgb(255,155, 42), 10%)
 * 
 * 最后计算为
 * r: 255*10% + 255 * 90% = 255
 * g: 255*0.1 + 155*0.9 = 165
 * b: 255*0.1 +  42*0.9 = 63.33 = Math.round(63.33) = 63;
 *  => rgb(255, 165, 63)
 * 对应的16进制色值即为：
 * (255).toString(16) = ff;
 * (165).toString(16) = a5;
 * (63).toString(16) = 3f;
 * 即混合后色值 #ffa53f 对应的10进制值就是 
 * parseInt('ffa53f', 16) = 16753983 (最后用这个值求相近色值)
*/