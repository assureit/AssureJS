var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var HoverPlugIn = (function (_super) {
    __extends(HoverPlugIn, _super);
    function HoverPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.ActionPlugIn = new HoverActionPlugIn(plugInManager);
    }
    return HoverPlugIn;
})(AssureIt.PlugInSet);

var HoverActionPlugIn = (function (_super) {
    __extends(HoverActionPlugIn, _super);
    function HoverActionPlugIn() {
        _super.apply(this, arguments);
    }
    HoverActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    HoverActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        $('.node').hover(function () {
            var thisNodeLabel = $(this).children('h4').text();
            caseViewer.ViewMap[thisNodeLabel].SVGShape.EnableHighlight();
        }, function () {
            var thisNodeLabel = $(this).children('h4').text();
            caseViewer.ViewMap[thisNodeLabel].SVGShape.DisableHighlight();
        });

        return true;
    };
    return HoverActionPlugIn;
})(AssureIt.ActionPlugIn);
