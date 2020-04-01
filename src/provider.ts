import * as vscode from 'vscode';
import { RProcess } from "./process";

export class RProvider implements vscode.CompletionItemProvider {

    constructor(private process: RProcess) { }

    provideCompletionItems (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.CompletionItem[]  {
        // return new Promise((resolve, reject) => {
			
            let wordAtPosition = document.getWordRangeAtPosition(position);
            
            if(!wordAtPosition) {
                // 不存在position就是输入空格的时候， 这个时候将position的位置倒退1
                let newCharacter = position.character-1;
                let newLine = position.line;
                let newPosition = new vscode.Position(newLine,newCharacter);
                wordAtPosition = document.getWordRangeAtPosition(newPosition);
            }
            
            var currentWord = '';
			if (wordAtPosition && wordAtPosition.start.character < position.character) {
				var word = document.getText(wordAtPosition);
				currentWord = word.substr(0, position.character - wordAtPosition.start.character);
            }

            let  res = this.process.convert(currentWord);
            if (!res) {
                return [];
            }
            // 这个值必须和输入的值一样才可以
            // const item = new vscode.CompletionItem('#123123');
            // const { preColor = {}, prePx = {}, variablePx = [], variableColor = [] } = res;
            const { preValue = {}, variableList = [] } = res;
            const completionItemList = variableList.map((dep:any) => {
                const item = new vscode.CompletionItem(`${dep.key}:${dep.value}`, vscode.CompletionItemKind.Variable);
                document.getWordRangeAtPosition(position);
                item.insertText = dep.key;
                item.sortText = dep.sortIndex;
                return item;
            });
            // let completionItemList: vscode.CompletionItem[] = [];
            // const completionItemList: vscode.CompletionItem[] = new vscode.CompletionList(list);
            // _.each(completionItemList, (item:vscode.CompletionItem ) => {
            //     item.sortText = 'difference';
            // })   
            // return resolve(completionItemList);
            return completionItemList;
        // });
    }
}