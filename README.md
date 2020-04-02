# color/px to variable README
插件解决的问题：
    当我们写了类似variable.less 这样的变量文件后， 在其他style文件应用时， 可能需要反复回到variable.less中去查找对应值的变量是什么， 然后粘贴复制过去， 还可能存在UI给的值不太准确，反复查找，浪费时间。

## Features
<!-- 输入颜色值，回车查找变量值， 注意：需要输入完整的色值才能匹配到最优的 -->
输入字体大小， eg: 12px 回车匹配最优字体大小, 按照差值大小排序, 选择后,返回该字体对应的变量值


## Extension Settings

### For more information

* see change log https://github.com/Bossmmh/valueToVariable.git
**Enjoy!**

TODO:
1. 暂时只开放px转变量的功能
2. 已获取到文件夹下所有文件的内容-其中颜色的定义， 对于一个变量引用了另外一个变量的情形还未写, mix 计算的已完成
3. 每个语句结尾需要加；才可以正确解析出所有, 解析规则为 /^@.*;$/
4. 目前只支持一个vscode 窗口打开一个工作目录， 存在Multi-root会获取不准确
