/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class NoteHTMLRenderPlugIn extends HTMLRenderPlugIn {
	IsEnabled(caseViewer: CaseViewer, caseModel: CaseModel) : boolean {
		return true;
	}

	Delegate(caseViewer: CaseViewer, caseModel: CaseModel) : boolean {
		// TODO
		return true;
	}
}
