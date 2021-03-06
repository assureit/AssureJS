///<reference path="../../src/CaseModel.ts" />
///<reference path="../../src/CaseEncoder.ts" />
///<reference path="../../src/PlugInManager.ts" />

class CommitWindow {

	defaultMessage: string = "Type your commit message...";

	constructor() {
		this.Init();
	}

	Init(): void {
		$('#modal-commit').remove();
		var modal = $('<div id="modal-commit" title="Commit Message" />');
		(<any>modal).dialog({
			autoOpen: false,
			modal: true,
			resizable: false,
			draggable: false,
			show: "clip",
			hide: "fade"
		});

		var messageBox = $('<p align="center"></p>');
		messageBox.append($('<input id="message_box" type="text" size="30" value="'
					+ this.defaultMessage
					+ '" />')
				.css({ 'color': 'gray', 'width': '18em', 'height': '2em' }));

		var commitButton  = $('<p align="right"><input id="commit_button" type="button" value="commit"/></p>');
		modal.append(messageBox);
		modal.append(commitButton);
		modal.appendTo($('layer2'));
	}

	UpdateLastModified(summary: any, case0: AssureIt.Case, lastModified: any) : void{
		if (lastModified == null) lastModified = {};
		var userName = $.cookie('userName');
		var oldcase = new AssureIt.Case('oldCase', JSON.stringify(case0.oldsummary), case0.oldasn, case0.CaseId, case0.CommitId, null);
		var caseDecoder = new AssureIt.CaseDecoder();
		var root = caseDecoder.ParseASN(oldcase, case0.oldasn, null);
		oldcase.SetElementTop(root);
		var res = {};

		/* Compare case0.ElementMap and oldcase.ElementMap */
		var added: string[] = [], deleted: string[] = [], modified: string[] = [];
		for (var i in case0.ElementMap) {
			var node = case0.ElementMap[i];
			var oldnode = oldcase.ElementMap[i];
			if (oldnode == null) {
				added.push(i);
				res[i] = {userName: $.cookie('userName'), role: 'admin'};
			} else if (node.Equals(oldnode)) {
				if (lastModified[i] != null) {
					res[i] = lastModified[i];
				}
			} else {
				modified.push(i);
				res[i] = {userName: $.cookie('userName'), role: 'admin'}
			}
		}

		for (var i in oldcase.ElementMap) {
			if (case0.ElementMap[i] == null) {
				deleted.push(i);
			}
		}
		summary.lastModified = res;
		summary.added = added;
		summary.modified = modified;
		summary.deleted = deleted;
	}

	MakeSummary(case0: AssureIt.Case): any {
		var oldsummary = case0.oldsummary;
		if (oldsummary == null) {
			oldsummary = {};
		}
		var summary: any = {};

		summary.count = Object.keys(case0.ElementMap).length;

		/* TODO update summary.lastModified */
		this.UpdateLastModified(summary, case0, oldsummary.lastModified);

		return summary;
	}

	SetEventHandlers(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): void {
		var self = this;

		$('#message_box').focus(function() {
			if($(this).val() == self.defaultMessage) {
				$(this).val("");
				$(this).css('color', 'black');
			}
		});

		$('#message_box').blur(function() {
			if($(this).val() == "") {
				$(this).val(self.defaultMessage);
				$(this).css('color', 'gray');
			}
		});

		function commit() {
			var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
			var contents : string = encoder.ConvertToASN(case0.ElementTop, false);

			if($("#message_box").val() == self.defaultMessage) {
				alert("Please put some commit message in the text box.");
			}
			else {
				serverApi.Commit(contents, $("#message_box").val(), case0.CommitId, self.MakeSummary(case0));
				case0.SetModified(false);
				window.location.reload(); //FIXME
			}
		}

		$('#message_box').keydown(function(e: JQueryEventObject) {
			if(e.keyCode == 13) {
				e.stopPropagation();
				commit();
			}
		});

		$('#commit_button').click(commit);
	}

}

class CommitPlugIn extends AssureIt.PlugInSet {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.SideMenuPlugIn = new CommitSideMenuPlugIn(plugInManager);
	}
}

class CommitSideMenuPlugIn extends AssureIt.SideMenuPlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, Case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		return Case0.IsEditable();
	}

	AddMenu(caseViewer: AssureIt.CaseViewer, Case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): AssureIt.SideMenuModel {
		var commitWindow: CommitWindow = new CommitWindow();
		commitWindow.SetEventHandlers(caseViewer, Case0, serverApi);

		return new AssureIt.SideMenuModel('#', "Commit", "commit", "glyphicon-floppy-disk", (ev:Event)=>{
			(<any>$('#modal-commit')).dialog('open');
		});
	}

}
