var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NotePlugIn = (function (_super) {
    __extends(NotePlugIn, _super);
    function NotePlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.HTMLRenderPlugIn = new NoteHTMLRenderPlugIn(plugInManager);
    }
    return NotePlugIn;
})(AssureIt.PlugInSet);

var NoteHTMLRenderPlugIn = (function (_super) {
    __extends(NoteHTMLRenderPlugIn, _super);
    function NoteHTMLRenderPlugIn() {
        _super.apply(this, arguments);
    }
    NoteHTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, nodeModel) {
        return true;
    };

    NoteHTMLRenderPlugIn.prototype.Delegate = function (caseViewer, nodeModel, element) {
        element.children("p").remove();

        for (var i = 0; i < nodeModel.Notes.length; i++) {
            var note = nodeModel.Notes[i];

            for (var key in note.Body) {
                $('<p style="color: DarkOliveGreen">' + key + ": " + note.Body[key] + '</p>').appendTo(element);
            }
        }
        return true;
    };
    return NoteHTMLRenderPlugIn;
})(AssureIt.HTMLRenderPlugIn);
