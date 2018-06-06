'use babel';

import AutoNumView from './auto-num-view';
import { CompositeDisposable } from 'atom';

export default {

  autoNumView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.autoNumView = new AutoNumView(state.autoNumViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'auto-num:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.autoNumView.destroy();
  },

  serialize() {
    return {
      autoNumViewState: this.autoNumView.serialize()
    };
  },

  getNumByIndex(str, index, defaultNum = 1) {
    let numList = str.match(/[+-]?[0-9]+/g);
    if (numList) {
      numList = numList.filter(num => num != '');
      if (numList.length >= index - 1) {
        return parseInt(numList[index - 1]);
      }
    }
    return defaultNum;
  },

  toggle() {
    const editor = atom.workspace.getActivePaneItem();
    const selections = editor.getSelections();
    if (selections.length > 1) {
      let start = 1;
      let add = 1;
      let mul = 1;
      // 第一行选中
      let text = selections[0].getText();
      if (text != '') {
        // i++
        // i--
        // i+=i
        // i*=i
        if (text.match(/^[+-]?[0-9]*\s*\+\+\s*$/)) {
          start = this.getNumByIndex(text, 1);
          add = 1;
          mul = 1;
        } else if (text.match(/^[+-]?[0-9]*\s*\-\-\s*$/)) {
          start = this.getNumByIndex(text, 1, -1);
          add = -1;
          mul = 1;
        } else if (text.match(/^[+-]?[0-9]*\s*\+\=\s*[+-]?[0-9]*\s*$/)) {
          start = this.getNumByIndex(text, 1);
          add = this.getNumByIndex(text, 2);
          mul = 1;
        } else if (text.match(/^[+-]?[0-9]*\s*\*\=\s*[+-]?[0-9]*\s*$/)) {
          start = this.getNumByIndex(text, 1);
          add = 0;
          mul = this.getNumByIndex(text, 2);
        }
      }
      selections.map((selection, index) => {
        selection.insertText((start).toString());
        start = start * mul + add;
      });
    }
    console.log('AutoNum was toggled!');
  }

};
