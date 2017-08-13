$("#fieldFileTable").bootstrapTable({
    url: 'sys/file/getFields',
    queryParams: function (params) {
        return {
            offset: params.offset,
            limit: params.limit,
            fieldName: $('#queryFieldText').val().trim(),
            blockId: $('#queryBlockText').val(),
            cropId: $('#queryCropText').val(),
            useStatus: $('#queryUseStatusText').val()
        }
    },
    columns: [{
        field: 'fieldId',
        title: '大棚编号'
    }, {
        field: 'fieldName',
        title: '大棚名称'
    }, {
        field: 'block.blockName',
        title: '所属地块'
    }, {
        field: 'crop.cropName',
        title: '种植作物'
    }, {
        formatter: function (value, row, index) {
            var useStatus = row.useStatus;
            var format = '';
            if (useStatus == 1) {
                format = '使用中'
            } else if (useStatus == 0) {
                format = '未使用'
            }
            return format;
        },
        title: '使用状态'
    }, {
        field: 'fieldPs',
        title: '备注'
    }, {
        formatter: function (value, row, index) {
            return [
                '<a href="javascript:modifyField(' + "'" + row.fieldId + "', '" + row.fieldName + "', '"
                + row.block.blockId + "', '" + convertCropId(row.crop) + "', '" + row.useStatus + "', '"
                + convertFieldPs(row) + "'" + ')">' +
                '<i class="glyphicon glyphicon-pencil"></i>修改' +
                '</a>',
                '<a href="javascript:removeField(' + "'" + row.fieldId + "'" + ')">' +
                '<i class="glyphicon glyphicon-remove"></i>删除' +
                '</a>'
            ].join('');
        },
        title: '操作'
    }],
    striped: true,
    pagination: true,
    sidePagination: 'server',
    pageSize: 10,
    pageList: [5, 10, 25]
});

// 处理json中cropId可能出现的null值
function convertCropId(crop) {
    try {
        return crop.cropId;
    } catch (err) {
        return '';
    }
}

// 处理json中fieldPs可能出现的null值
function convertFieldPs(row) {
    if (null == row.fieldPs) {
        return '';
    } else {
        return row.fieldPs;
    }
}

// 重置
$('#resetBtn').click(function () {
    $('#queryFieldText').val('');
    $('#queryToolBar .selectpicker').selectpicker('val', '');
    $('#queryBtn').trigger('click');
});

// 查询
$('#queryBtn').click(function () {
    $("#fieldFileTable").bootstrapTable('selectPage', 1);
});

// 设置bootbox中文支持
bootbox.setLocale('zh_CN');

// 数据提交
function deliverData(path, fieldId, fieldName, blockId, cropId, useStatus, fieldPs) {
    $.ajax({
        url: path,
        type: 'post',
        data: {
            fieldId: fieldId,
            fieldName: fieldName,
            blockId: blockId,
            cropId: cropId,
            useStatus: useStatus,
            fieldPs: fieldPs
        },
        success: function (res) {
            bootbox.alert({
                title: '提示',
                message: res.message
            });
            $("#fieldFileTable").bootstrapTable('selectPage', 1);
        }
    });
}

// 新增
$('#addBtn').click(function () {
    // 清空新增modal内容
    $('.modal :text').val('');
    $('#addFieldPsText').val('');
    var $select = $('.modal .selectpicker');
    $select.each(function () {
        $(this).find('option:first').prop('selected', true);
    });
    $select.selectpicker('refresh');

    $('#addModal').modal('show');
});

$('#saveAdd').click(function () {
    var fieldId = $('#addFieldIdText').val().trim();
    var fieldName = $('#addFieldNameText').val().trim();
    var blockId = $('#addBlockIdText').val();
    var cropId = $('#addCropIdText').val();
    var useStatus = $('#addUseStatusText').val();
    var fieldPs = $('#addFieldPsText').val().trim();

    $('#addModal').modal('hide');

    if (fieldId == '' || fieldName == '' || blockId == '') {
        bootbox.alert({
            title: '提示',
            message: '请输入完整信息！'
        });
    } else if (fieldPs.length > 80) {
        bootbox.alert({
            title: '提示',
            message: '大棚备注限输入80个字符！'
        });
    } else {
        bootbox.confirm({
            title: '提示',
            message: '确认新增大棚信息',
            callback: function (flag) {
                if (flag) {
                    deliverData('sys/file/addField', fieldId, fieldName, blockId, cropId, useStatus, fieldPs);
                }
            }
        });
    }

});

// 修改
function modifyField(fieldId, fieldName, blockId, cropId, useStatus, fieldPs) {
    $('#modifyFieldIdText').text(fieldId);
    $('#modifyFieldNameText').val(fieldName);
    $('#modifyBlockIdText').selectpicker('val', blockId);
    $('#modifyCropIdText').selectpicker('val', cropId);
    $('#modifyUseStatusText').selectpicker('val', useStatus);
    $('#modifyFieldPsText').val(fieldPs);

    $('#modifyModal').modal('show');
}

$('#saveModify').click(function () {
    var fieldId = $('#modifyFieldIdText').text();
    var fieldName = $('#modifyFieldNameText').val().trim();
    var blockId = $('#modifyBlockIdText').val();
    var cropId = $('#modifyCropIdText').val();
    var useStatus = $('#modifyUseStatusText').val();
    var fieldPs = $('#modifyFieldPsText').val().trim();

    $('#modifyModal').modal('hide');

    if (fieldName == '' || blockId == '') {
        bootbox.alert({
            title: '提示',
            message: '请输入完整信息！'
        });
    } else if (fieldPs.length > 80) {
        bootbox.alert({
            title: '提示',
            message: '大棚备注限输入80个字符！'
        });
    } else {
        bootbox.confirm({
            title: '提示',
            message: '确认修改大棚信息',
            callback: function (flag) {
                if (flag) {
                    deliverData('sys/file/modifyField', fieldId, fieldName, blockId, cropId, useStatus, fieldPs);
                }
            }
        });
    }
});

// 删除
function removeField(fieldId) {
    bootbox.confirm({
        title: '提示',
        message: '确认删除大棚信息',
        callback: function (flag) {
            if (flag) {
                deliverData('sys/file/removeField', fieldId);
            }
        }
    });
}