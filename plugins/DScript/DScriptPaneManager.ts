class DScriptPaneManager {
	ParentWidget: JQuery;
	Widgets: HTMLElement[];
	Options: any;
	RefreshFunc;
	
 	constructor(parentWidget: JQuery, widget0: JQuery, keepStyle: boolean = false) {
		this.ParentWidget = parentWidget;
		this.Widgets = [widget0.get(0)];
		this.Options = {};
		this.RefreshFunc = function(){};

		var frame: JQuery = this.CreateFrame();;
		if (widget0 != null) {
			parentWidget.append(frame.append(widget0.addClass("managed-widget")));
		}
		else {
			parentWidget.append(frame.append(this.CreateDefaultWidget().addClass("managed-widget")));
		}
		DScriptPaneManager.ExpandWidget(frame);
		if (!keepStyle) DScriptPaneManager.ExpandWidget(widget0);
 	}

	static ExpandWidget(widget: JQuery): void {
		widget.css({
			position : 'absolute',
			top : 0,
			left : 0,
			height : '100%',
			width : '100%',
		});
	}
	static CopyStyle(src: JQuery, dist: JQuery): void {
		dist.css({
			top : src.css("top"),
			left : src.css("left"),
			height : src.css("height"),
			width : src.css("width"),
			borderRightWidth : src.css("border-right-width"),
			borderLeftWidth : src.css("border-left-width"),
			borderTopWidth : src.css("border-top-width"),
			borderBottomWidth : src.css("border-bottom-width"),
		});
	}

	public AddToOptionsList(widget: JQuery, name: string, overrideFlag: boolean, keepStyle = false): void {
		if (name in this.Options && !overrideFlag) {
			console.log("DScriptPaneManaer:Warning!! Cannot append the Option " + name);
		}
		else {
			if (!keepStyle) DScriptPaneManager.ExpandWidget(widget);
			this.Options[name] = widget;
		}
	}

	public SetRefreshFunc(func) {
		this.RefreshFunc = func;
	}

	public RefreshDefaultWidget(): void {
		var usedList = [];
		for (var key in this.Options) {
			if (this.Widgets.indexOf(this.Options[key].get(0)) != -1) {
				usedList.push(key);
			}
		}
		$(".widget-select-button").each(function() {
			if (usedList.indexOf($(this).text()) != -1) {
				this.remove();
			}
		});
	}

	public CreateDefaultWidget(): JQuery { // create buttons from OptionsList
		var defaultWidget = $("<div/>").addClass("btn-group-vertical default-widget");
		var self = this;
		for (var key in self.Options) {
			if (this.Widgets.indexOf(self.Options[key].get(0)) != -1) continue;
			var newButton = $("<button/>").addClass("btn btn-default widget-select-button");
			newButton.text(key);
			newButton.click(function() {
				var frame = defaultWidget.parent();
				var widget = self.Options[$(this).text()];
				widget.addClass("managed-widget");
				self.Widgets.push(widget.get(0));
				frame.append(widget);
				defaultWidget.remove();
				self.RefreshFunc();
				self.RefreshDefaultWidget();
			});
			defaultWidget.append(newButton);
		}
		return defaultWidget;
	}

	private CreateFrame(): JQuery {
		var self = this;
		var newFrame: JQuery = $("<div/>");

		var buttonUp: JQuery = $("<canvas width='40px' height='40px'></canvas>");
		buttonUp.css({
			position : "absolute",
			right : 0,
			top : 0,
			zIndex : 10,
		});
		var ctx = buttonUp.get(0).getContext("2d");
		ctx.beginPath();
		ctx.moveTo(5, 20);
		ctx.lineTo(35, 20);
		ctx.strokeRect(5, 5, 30, 30);
		ctx.closePath();
		ctx.stroke();
		buttonUp.click(function() {
			console.log("click up");
			var widget = newFrame.children(".managed-widget");
			if (widget.length == 1 &&
				(self.Widgets.indexOf(widget.get(0)) != -1 ||
				 widget.hasClass("default-widget"))) {
				self.AddWidgetOnBottom(widget, self.CreateDefaultWidget());
			}
			else {
				console.log("DScriptPaneManager error");
				console.log(widget);
				console.log(self.Widgets);
			}
		});
		var buttonLeft: JQuery = $("<canvas width='40px' height='40px'></canvas>");
		buttonLeft.css({
			position : "absolute",
			right : 0,
			top : 40,
			zIndex : 10,
		});
		var ctx = buttonLeft.get(0).getContext("2d");
		ctx.beginPath();
		ctx.moveTo(20, 5);
		ctx.lineTo(20, 35);
		ctx.strokeRect(5, 5, 30, 30);
		ctx.closePath();
		ctx.stroke();
		buttonLeft.click(function() {
			console.log("click left");
			var widget = newFrame.children(".managed-widget");
			if (widget.length == 1 &&
				(self.Widgets.indexOf(widget.get(0)) != -1 ||
				 widget.hasClass("default-widget"))) {
				self.AddWidgetOnRight(widget, self.CreateDefaultWidget());
			}
			else {
				console.log("DScriptPaneManager error");
				console.log(widget);
				console.log(self.Widgets);
			}
		});
		var buttonDelete: JQuery = $("<canvas width='40px' height='40px'></canvas>");
		buttonDelete.css({
			position : "absolute",
			right : 0,
			top : 80,
			zIndex : 10,
		});
		var ctx = buttonDelete.get(0).getContext("2d");
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.moveTo(10, 10);
		ctx.lineTo(30, 30);
		ctx.moveTo(30, 10);
		ctx.lineTo(10, 30);
		ctx.closePath();
		ctx.stroke();
		buttonDelete.click(function() {
			console.log("click delete");
			self.DeleteWidget($(this).parent().children(".managed-widget"));
		});
		
		newFrame.append(buttonUp);
		newFrame.append(buttonLeft);
		newFrame.append(buttonDelete);
		newFrame.addClass("managed-frame");
		newFrame.css({
			borderColor : "#000000",
			borderStyle : "solid",
			borderWidth : 0,
		});
		newFrame.children("canvas").addClass("widget-split-button");

		return newFrame;
	}

	private DeleteWidget(locatedWidget: JQuery) { // don't delete widget, but delete the frame which has the widget
		var currentFrame = locatedWidget.parent(".managed-frame");
		var parentFrame = currentFrame.parent(".managed-frame");
		var siblingFrame = currentFrame.siblings(".managed-frame");
		var idx = this.Widgets.indexOf(locatedWidget.get(0));
		if (idx != -1) this.Widgets.splice(idx, 1);
		if (parentFrame.length == 0) { // exist one widget in panemanager
			var newWidget = this.CreateDefaultWidget().addClass("managed-widget");
			DScriptPaneManager.ExpandWidget(newWidget);
			locatedWidget.after(newWidget);
			locatedWidget.remove();
		}
		else {
			DScriptPaneManager.CopyStyle(parentFrame, siblingFrame);
			parentFrame.parent().append(siblingFrame);
			parentFrame = currentFrame.parent(".managed-frame");
			parentFrame.remove();
		}
		this.RefreshFunc();
	}

	private AddWidgetCommon(locatedWidget: JQuery, newWidget: JQuery, keepStyle: boolean = false) {
		var ret: boolean = false;
		var index: number = this.Widgets.indexOf(locatedWidget.get(0));
		var isDefaultWidget = locatedWidget.hasClass("default-widget");
		if (index != -1 || isDefaultWidget) {
			ret = true;
			newWidget.addClass("managed-widget");
			if (isDefaultWidget) this.Widgets.push(newWidget.get(0));
			var childFrame1: JQuery = this.CreateFrame();
			var childFrame2: JQuery = this.CreateFrame();
			var parentFrame: JQuery = locatedWidget.parent();
			childFrame1.append(locatedWidget);
			childFrame2.append(newWidget);
			if (!keepStyle) DScriptPaneManager.ExpandWidget(newWidget);
			parentFrame.children(".widget-split-button").css("display", "none");
			parentFrame.append(childFrame1).append(childFrame2);
			this.RefreshFunc();
		}
		else {
			//pass
		}
		return ret;
	}

 	public AddWidgetOnRight(locatedWidget: JQuery, newWidget: JQuery, keepStyle: boolean = false) {
		var ret: boolean = false;
		if (this.AddWidgetCommon(locatedWidget, newWidget, keepStyle)) {
			locatedWidget.parent().css({
				position : 'absolute',
				top : 0,
				left : 0,
				height : '100%',
				width : '50%',
				borderRightWidth: '1px'
			});
			newWidget.parent().css({
				position : 'absolute',
				top : 0,
				left : '50%',
				height : '100%',
				width : '50%',
			});
		}
		else {
			//pass
		}
 	}

 	public AddWidgetOnLeft(locatedWidget: JQuery, newWidget: JQuery, keepStyle: boolean = false) {
		var ret: boolean = false;
		if (this.AddWidgetCommon(locatedWidget, newWidget, keepStyle)) {
			locatedWidget.parent().css({
				position : 'absolute',
				top : 0,
				left : '50%',
				height : '100%',
				width : '50%',
				borderLeftWidth: '1px'
			});
			newWidget.parent().css({
				position : 'absolute',
				top : 0,
				left : 0,
				height : '100%',
				width : '50%',
			});
		}
		else {
			//pass
		}
 	}

 	public AddWidgetOnTop(locatedWidget: JQuery, newWidget: JQuery, keepStyle: boolean = false) {
		var ret: boolean = false;
		if (this.AddWidgetCommon(locatedWidget, newWidget, keepStyle)) {
			locatedWidget.parent().css({
				position : 'absolute',
				top : '50%',
				left : 0,
				height : '50%',
				width : '100%',
				borderTopWidth: '1px'
			});
			newWidget.parent().css({
				position : 'absolute',
				top : 0,
				left : 0,
				height : '50%',
				width : '100%',
			});
		}
		else {
			//pass
		}
 	}

 	public AddWidgetOnBottom(locatedWidget: JQuery, newWidget: JQuery, keepStyle: boolean = false) {
		var ret: boolean = false;
		if (this.AddWidgetCommon(locatedWidget, newWidget, keepStyle)) {
			locatedWidget.parent().css({
				position : 'absolute',
				top : 0,
				left : 0,
				height : '50%',
				width : '100%',
				borderBottomWidth: '1px'
			});
			newWidget.parent().css({
				position : 'absolute',
				top : '50%',
				left : 0,
				height : '50%',
				width : '100%',
			});
		}
		else {
			//pass
		}
 	}
}
