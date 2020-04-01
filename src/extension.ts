// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const path = require('path');

import { RProcess } from './process';
import { RProvider } from './provider';

import {walk, dealScri, handleFr, saveContent, extnameList} from './utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-plugin-demo" is now active!');

	const dir = vscode.workspace.rootPath || '';
	const variableList = handleFr(dealScri(walk(dir)));
	saveContent(variableList);

	const process = new RProcess();
	let provider = new RProvider(process);
	const LANS = ['less', 'scss', 'sass'];
	for (let lan of LANS) {
		let providerDisposable = vscode.languages.registerCompletionItemProvider(lan, provider, ' ');
		context.subscriptions.push(providerDisposable);
	}

	// 	监听
	const didSaveDisposable = vscode.workspace.onDidSaveTextDocument(((e) => {
		const dir = vscode.workspace.rootPath || '';
		const {fileName = ''} = e;
		const extname = path.extname(fileName);
		if(extnameList.includes(extname)) {
			const variableList = handleFr(dealScri(walk(dir)));
			saveContent(variableList);
		}
	}));

	context.subscriptions.push(didSaveDisposable);

	// Hello World
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() {}
