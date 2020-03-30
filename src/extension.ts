// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { RProcess } from './process';
import { RProvider } from './provider';

import {walk, dealScri, handleFr} from './utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-plugin-demo" is now active!');

	const dir = vscode.workspace.rootPath || '';
	const variableList = handleFr(dealScri(walk(dir)));
	// console.log('=====handleFr(dealScri(walk(dir)))', handleFr(dealScri(walk(dir))));
	console.log('=======variableList', variableList);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);


	const process = new RProcess(variableList);
	let provider = new RProvider(process);
	const LANS = ['less', 'scss', 'sass'];
	for (let lan of LANS) {
		let providerDisposable = vscode.languages.registerCompletionItemProvider(lan, provider, ' ');
		context.subscriptions.push(providerDisposable);
	}

}

// this method is called when your extension is deactivated
export function deactivate() {}
