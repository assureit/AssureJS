var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var monitorNodeManager = null;
var monitorWindow = null;

var MonitorPlugIn = (function (_super) {
    __extends(MonitorPlugIn, _super);
    function MonitorPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.HTMLRenderPlugIn = new MonitorHTMLRenderPlugIn(plugInManager);
        this.SVGRenderPlugIn = new MonitorSVGRenderPlugIn(plugInManager);

        this.SideMenuPlugIn = new MonitorSideMenuPlugIn(plugInManager);
        monitorNodeManager = new MonitorNodeManager();
        this.PlugInEnv = { "ActionNodeManager": monitorNodeManager };
    }
    return MonitorPlugIn;
})(AssureIt.PlugInSet);

var MonitorHTMLRenderPlugIn = (function (_super) {
    __extends(MonitorHTMLRenderPlugIn, _super);
    function MonitorHTMLRenderPlugIn() {
        _super.apply(this, arguments);
    }
    MonitorHTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, nodeModel) {
        return true;
    };

    MonitorHTMLRenderPlugIn.prototype.Delegate = function (caseViewer, nodeModel, element) {
        var proto = (nodeModel.Parent != null ? nodeModel.Parent.Environment : {});
        nodeModel.UpdateEnvironment(proto);
        if (!isMonitorNode(nodeModel))
            return;
        monitorNodeManager.SetMonitorNode(nodeModel);

        var monitorNode = monitorNodeManager.ActionNodeMap[nodeModel.Label];
        if (monitorNode == null || !("Item" in monitorNode))
            return;

        this.RenderPastMonitoringData(monitorNode, element);
    };

    MonitorHTMLRenderPlugIn.prototype.RenderPastMonitoringData = function (monitorNode, element) {
        element.children("#monitor-logs").remove();

        var $logs = $('<div id="monitor-logs"></div>');
        if (monitorNode.PastData.length < 1) {
            return true;
        }

        var linkColor;
        if (monitorNode.Status == true) {
            linkColor = 'blue';
        } else {
            linkColor = 'red';
        }

        var $link = $('<a href="#"><p align="right" style="color: ' + linkColor + '">Monitor Log</p></a>');
        $link.click(function (ev) {
            ev.stopPropagation();
            monitorWindow.ShowMonitorLogTable(monitorNode.EvidenceNode.Label);
        });

        $link.appendTo($logs);
        $logs.appendTo(element);
    };
    return MonitorHTMLRenderPlugIn;
})(AssureIt.HTMLRenderPlugIn);

var MonitorSVGRenderPlugIn = (function (_super) {
    __extends(MonitorSVGRenderPlugIn, _super);
    function MonitorSVGRenderPlugIn() {
        _super.apply(this, arguments);
    }
    MonitorSVGRenderPlugIn.prototype.IsEnabled = function (caseViewer, nodeView) {
        return true;
    };

    MonitorSVGRenderPlugIn.prototype.Delegate = function (caseViewer, nodeView) {
        var nodeModel = nodeView.Source;
        var monitorNode = monitorNodeManager.ActionNodeMap[nodeModel.Label];

        if (!monitorNode)
            return true;

        if (monitorNode.Status) {
            monitorNode.BlushAllAncestor(caseViewer, nodeView, AssureIt.Color.Default);
        } else {
            monitorNode.BlushAllAncestor(caseViewer, nodeView, AssureIt.Color.Danger);
        }

        return true;
    };
    return MonitorSVGRenderPlugIn;
})(AssureIt.SVGRenderPlugIn);

var MonitorWindow = (function () {
    function MonitorWindow() {
    }
    MonitorWindow.prototype.InitWindow = function (tableTitle) {
        $('#modal-monitors').remove();
        var $modal = $('<div id="modal-monitors" title="' + tableTitle + '"/>');

        ($modal).dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            draggable: false,
            show: "clip",
            hide: "fade",
            width: 800,
            height: 500
        });

        return $modal;
    };

    MonitorWindow.prototype.ShowMonitorTable = function () {
        var self = this;
        var $modal = this.InitWindow("Monitors");

        var $table = $('<table id="monitor-table" bgcolor="#999999">' + '<thead>' + '<tr>' + '<th>Monitor Node</th>' + '<th>Type</th>' + '<th>Location</th>' + '<th>Latest Data</th>' + '<th>Auth ID</th>' + '<th>Timestamp</th>' + '<th>Status</th>' + '</tr>' + '</thead>' + '</table>');

        var $tbody = $('<tbody></tbody>');
        for (var key in monitorNodeManager.ActionNodeMap) {
            var monitorNode = monitorNodeManager.ActionNodeMap[key];

            if (!("Item" in monitorNode))
                continue;

            if (monitorNode.LatestData != null) {
                var $tr = $('<tr id="monitorlog-' + monitorNode.EvidenceNode.Label + '"></tr>');
                $tr.unbind('click');

                $tr.append('<td>' + key + '</td>');
                $tr.append('<td>' + monitorNode.LatestData['type'] + '</td>');
                $tr.append('<td>' + monitorNode.LatestData['location'] + '</td>');
                $tr.append('<td>' + monitorNode.LatestData['data'] + '</td>');
                $tr.append('<td>' + monitorNode.LatestData['authid'] + '</td>');
                $tr.append('<td>' + monitorNode.LatestData['timestamp'] + '</td>');
                if (monitorNode.Status) {
                    $tr.append('<td>Success</td>');
                } else {
                    $tr.append('<td>Fail</td>');
                }

                $tr.click(function () {
                    self.ShowMonitorLogTable(monitorNode.EvidenceNode.Label);
                });

                $tr.appendTo($tbody);
            }
        }

        $tbody.appendTo($table);
        $table.appendTo($modal);
        $modal.appendTo('layer2');

        ($('#monitor-table')).dataTable({
            "bPaginate": true,
            "bLengthChange": true,
            "bFilter": true,
            "bSort": true,
            "bInfo": true,
            "bAutoWidth": true
        });

        self.Open();
    };

    MonitorWindow.prototype.ShowMonitorLogTable = function (label) {
        var $modal = this.InitWindow(label + " Logs");

        var $table = $('<table id="monitor-table" bgcolor="#999999">' + '<thead>' + '<tr>' + '<th>Timestamp</th>' + '<th>Type</th>' + '<th>Location</th>' + '<th>Latest Data</th>' + '<th>Auth ID</th>' + '</tr>' + '</thead>' + '</table>');

        var $tbody = $('<tbody></tbody>');
        var pastData = (monitorNodeManager.ActionNodeMap[label]).PastData;
        for (var i = 0; i < pastData.length; i++) {
            var $tr = $('<tr></tr>');
            $tr.append('<td>' + pastData[i]['timestamp'] + '</td>');
            $tr.append('<td>' + pastData[i]['type'] + '</td>');
            $tr.append('<td>' + pastData[i]['location'] + '</td>');
            $tr.append('<td>' + pastData[i]['data'] + '</td>');
            $tr.append('<td>' + pastData[i]['authid'] + '</td>');
            $tr.appendTo($tbody);
        }

        $tbody.appendTo($table);
        $table.appendTo($modal);
        $modal.appendTo('layer2');

        ($('#monitor-table')).dataTable({
            "bPaginate": true,
            "bLengthChange": true,
            "bFilter": true,
            "bSort": true,
            "bInfo": true,
            "bAutoWidth": true
        });

        this.Open();
    };

    MonitorWindow.prototype.Open = function () {
        ($('#modal-monitors')).dialog('open');
    };
    return MonitorWindow;
})();

var MonitorSideMenuPlugIn = (function (_super) {
    __extends(MonitorSideMenuPlugIn, _super);
    function MonitorSideMenuPlugIn(plugInManager) {
        _super.call(this, plugInManager);
    }
    MonitorSideMenuPlugIn.prototype.IsEnabled = function (caseViewer, Case0, serverApi) {
        return true;
    };

    MonitorSideMenuPlugIn.prototype.AddMenu = function (caseViewer, Case0, serverApi) {
        monitorNodeManager.Init(caseViewer, serverApi.recpath);
        monitorWindow = new MonitorWindow();

        return new AssureIt.SideMenuModel('#', 'Monitors', "monitors", "glyphicon-list-alt", function (ev) {
            monitorWindow.ShowMonitorTable();
        });
    };
    return MonitorSideMenuPlugIn;
})(AssureIt.SideMenuPlugIn);
