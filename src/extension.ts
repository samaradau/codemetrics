import * as vscode from 'vscode';
import {Disposable, DocumentSelector, languages, commands} from 'vscode';
import {CodeMetricsCodeLensProvider} from './providers/CodeMetricsCodeLensProvider';
import {AppConfiguration} from './models/AppConfiguration';
import {CodeMetricsParser} from './common/CodeMetricsParser';
import {CodeMetricsCodeLens} from './models/CodeMetricsCodeLens';

export function activate(context) {
  const config: AppConfiguration = new AppConfiguration();
  const disposables = [];
  const providers = [
    new CodeMetricsCodeLensProvider(config)
  ];
  providers.forEach(provider => {
    disposables.push(
      languages.registerCodeLensProvider(
        provider.selector,
        provider
      )
    );
  });

  const triggerCodeLensComputation = () => {
    var end = vscode.window.activeTextEditor.selection.end;
    vscode.window.activeTextEditor.edit((editbuilder) => {
      editbuilder.insert(end, " ");
    }).then(() => {
      commands.executeCommand("undo");
    });
  };

  disposables.push(commands.registerCommand("codemetrics.toggleCodeMetricsForArrowFunctions", () => {
    config.codeMetricsForArrowFunctionsToggled = !config.codeMetricsForArrowFunctionsToggled;
    triggerCodeLensComputation();
  }));

  disposables.push(commands.registerCommand("codemetrics.toggleCodeMetricsDisplayed", () => {
    config.codeMetricsDisplayed = !config.codeMetricsDisplayed;
    triggerCodeLensComputation();
  }));

  disposables.push(commands.registerCommand("codemetrics.showCodeMetricsCodeLensInfo", (codelens: CodeMetricsCodeLens) => {
    var items = codelens.children.map(item => item.getExplanation(config));
    vscode.window.showQuickPick(items).then(selected => {
      if (selected) {
        var selectedCodeLens: CodeMetricsCodeLens = codelens.children[items.indexOf(selected)];
        if (selectedCodeLens) {
          var cursorPosition = selectedCodeLens.range.start;
          vscode.window.activeTextEditor.selection = new vscode.Selection(selectedCodeLens.range.start, selectedCodeLens.range.start);
        }
      }
    });

  }))


  context.subscriptions.push(...disposables);
}