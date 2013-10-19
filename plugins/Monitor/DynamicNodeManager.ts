function extractTypeFromCondition(condition: string): string {
	var text: string = condition
						.replace(/\{/g, " ")
						.replace(/\}/g, " ")
						.replace(/\(/g, " ")
						.replace(/\)/g, " ")
						.replace(/==/g, " ")
						.replace(/<=/g, " ")
						.replace(/>=/g, " ")
						.replace(/</g, " ")
						.replace(/>/g, " ");

	var words: string[] = text.split(" ");
	var types: string[] = [];

	for(var i: number = 0; i < words.length; i++) {
		if(words[i] != "" && !$.isNumeric(words[i])) {
			types.push(words[i]);
		}
	}

	if(types.length != 1) {
		// TODO: alert
	}

	return types[0];
}

function appendNode(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, type: AssureIt.NodeType): AssureIt.NodeModel {
	var viewMap: { [index: string]: AssureIt.NodeView } = caseViewer.ViewMap;
	var view: AssureIt.NodeView = viewMap[nodeModel.Label];
	var case0: AssureIt.Case = caseViewer.Source;
	var newNodeModel = new AssureIt.NodeModel(case0, nodeModel, type, null, null, {});
	case0.SaveIdCounterMax(case0.ElementTop);
	viewMap[newNodeModel.Label] = new AssureIt.NodeView(caseViewer, newNodeModel);
	viewMap[newNodeModel.Label].ParentShape = viewMap[nodeModel.Label];
	return newNodeModel;
}


class MonitorManager {

	RECAPI: AssureIt.RECAPI;
	Timer: number;
	MonitorNodeMap: { [index: string]: MonitorNode };
	CaseViewer: AssureIt.CaseViewer;
	HTMLRenderFunctions: Function[];
	SVGRenderFunctions: Function[];
	ActiveMonitors: number;

	constructor() {
		this.MonitorNodeMap = {};
	}

	Init(caseViewer: AssureIt.CaseViewer, recpath: string) {
		this.RECAPI = new AssureIt.RECAPI(recpath);
		this.CaseViewer = caseViewer;
		this.HTMLRenderFunctions = [];
		this.HTMLRenderFunctions.push(this.CaseViewer.GetPlugInHTMLRender("note"));
		this.HTMLRenderFunctions.push(this.CaseViewer.GetPlugInHTMLRender("monitor"));
		this.SVGRenderFunctions = [];
		this.SVGRenderFunctions.push(this.CaseViewer.GetPlugInSVGRender("monitor"));
		this.ActiveMonitors = 0;
	}

	StartMonitors(interval: number) {
		console.log("start monitoring");
		var self = this;

		this.Timer = setInterval(function() {
			for(var key in self.MonitorNodeMap) {
				var monitorNode = self.MonitorNodeMap[key];

				if(self.CaseViewer.Source.ElementMap[key] == null) {
					self.RemoveMonitor(key);   // delete monitor
					continue;
				}

				if(monitorNode == null) {
					console.log("monitor:'"+key+"' is not registered");
				}

				if(!monitorNode.IsActive) {
					continue;
				}

				try {
					monitorNode.UpdateLatestData(self.RECAPI);
				}
				catch(e) {
					self.DeactivateAllMonitor();
					return;
				}

				if(monitorNode.LatestData == null) continue;

				monitorNode.UpdateStatus();
				monitorNode.Show(self.CaseViewer, self.HTMLRenderFunctions, self.SVGRenderFunctions);
			}

			self.CaseViewer.Draw();
		}, interval);
	}

	StopMonitors() {
		console.log("stop monitoring");
		clearTimeout(this.Timer);
	}

	SetMonitor(evidenceNode: AssureIt.NodeModel) {
		var location: string = getContextNode(evidenceNode.Parent).Notes["Location"];
		var condition: string = getContextNode(evidenceNode.Parent).Notes["Monitor"];
		var type: string = extractTypeFromCondition(condition);
		var monitorNode = this.MonitorNodeMap[evidenceNode.Label];

		if(monitorNode == null) {
			this.MonitorNodeMap[evidenceNode.Label] = new MonitorNode(location, type, condition, evidenceNode);
		}
		else {
			monitorNode.SetLocation(location);
			monitorNode.SetType(type);
			monitorNode.SetCondition(condition);
		}
	}

	RemoveMonitor(label: string) {
		if(this.MonitorNodeMap[label].IsActive) {
			this.ActiveMonitors -= 1;

			if(this.ActiveMonitors == 0) {   // manager has no monitor
				this.StopMonitors();
			}
		}

		delete this.MonitorNodeMap[label];
		if(Object.keys(this.MonitorNodeMap).length == 0) {
			this.StopMonitors();
		}
	}

	ActivateMonitor(label: string) {
		var monitorNode = this.MonitorNodeMap[label];

		if(!monitorNode.IsActive) {
			monitorNode.IsActive = true;
			this.ActiveMonitors += 1;
			if(this.ActiveMonitors == 1) {   // manager has one monitor
				this.StartMonitors(5000);
			}
		}
	}

	ActivateAllMonitor() {
		for(var label in this.MonitorNodeMap) {
			this.ActivateMonitor(label);
		}
	}

	DeactivateMonitor(label: string) {
		var monitorNode = this.MonitorNodeMap[label];

		if(monitorNode.IsActive) {
			monitorNode.IsActive = false;
			this.ActiveMonitors -= 1;
			if(this.ActiveMonitors == 0) {   // manager has no monitor
				this.StopMonitors();
			}
		}
	}

	DeactivateAllMonitor() {
		for(var label in this.MonitorNodeMap) {
			this.RemoveMonitor(label);
		}
	}

	IsRegisteredMonitor(label: string): boolean {
		if(label in this.MonitorNodeMap) {
			return true;
		}
		return false;
	}

}
