///<reference path='../../d.ts/jquery.d.ts'/>
///<reference path='../../src/CaseModel.ts'/>
///<reference path='../../src/CaseViewer.ts'/>

class DCaseFile {
	constructor(public result: string, public name: string){}
}

class ImportFile {

	constructor(public selector: string, public basepath: string) {
		var flag = true;
		$(this.selector).unbind('dragenter').unbind('dragover').unbind('dragleave');
		$(this.selector).on('dragenter', (e)=> {
			e.stopPropagation();
			e.preventDefault();
		}).on('dragover', function(e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).addClass('hover');
		}).on('dragleave', function(e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).removeClass('hover');
		});
	}

	upload(callback: (data: any, label: string)=> void): void {
		var self = this;
		$(this.selector).unbind('drop');
		$(this.selector).on('drop', function(e) {
			var node = $(this);
			var label = node.children('h4').text();

			e.stopPropagation();
			e.preventDefault();
			$(this).removeClass('hover');
			var files: File[] = (<any>e.originalEvent.dataTransfer).files;

			var fd = new FormData();
			for (var i = 0; i < files.length; i++) {
				fd.append("upfile", files[i]);
			}

			$.ajax(<JQueryAjaxSettings>{
				url: self.basepath + '/file',
				type: 'POST',
				data: fd,
				processData: false,
				contentType: <any>false,
				success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
					callback(data, label);
				}
			});
		});
	}
}

class DragFilePlugIn extends AssureIt.PlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new DragFileActionPlugIn(plugInManager);
		this.HTMLRenderPlugIn = new ImageFileHTMLPlugIn(plugInManager);
	}
}

class DragFileActionPlugIn extends AssureIt.ActionPlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return case0.IsLogin();
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		var importFile = new ImportFile(".node", this.plugInManager.basepath);
		importFile.upload((data: any, label: string) => {
				var nodeModel: AssureIt.NodeModel = case0.ElementMap[label];
				var nodeView: AssureIt.NodeView = caseViewer.ViewMap[label];
				var body = {Type: "ImageFile",URL: data.split('=')[1]};
				nodeModel.SetNote("ImageFile", body);
				nodeView.HTMLDoc.Render(caseViewer, nodeModel);
				caseViewer.ReDraw();
		});
		return true;
	}
}

class ImageFileHTMLPlugIn extends AssureIt.HTMLRenderPlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, element: JQuery) : boolean {
		var basepath = this.plugInManager.basepath;
		for (var i: number = 0; i < nodeModel.Notes.length; i++) {
			if(nodeModel.Notes[i].Name == "ImageFile") {
				var body = nodeModel.Notes[i].Body;
				var img = $(new Image());
				img.bind('load', function(){
					$('<a href="' + basepath + '/' + body.URL+'"></a>').append(img).appendTo(element);
					caseViewer.ReDraw();
				});
				img.attr('src',basepath+'/'+body.URL);
				//$('<a href="' + basepath + '/' + body.URL+'"><img id="img-'+ nodeModel.Label + '-' + i + '" src="'+basepath+'/'+body.URL+'" /></a>')
				//.appendTo(element);

				//$('#img-'+ nodeModel.Label + '-' + i + '')
				//.bind('load', function(){
				//	console.log("redraw");
				//	caseViewer.ReDraw();
				//})
			}
		}
		return true;
	}
}
