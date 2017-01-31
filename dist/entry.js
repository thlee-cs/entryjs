var Entry = {block:{}, TEXT_ALIGN_CENTER:0, TEXT_ALIGN_LEFT:1, TEXT_ALIGN_RIGHT:2, TEXT_ALIGNS:["center", "left", "right"], clipboard:null, loadProject:function(b) {
  b || (b = Entry.getStartProject(Entry.mediaFilePath));
  "workspace" == this.type && Entry.stateManager.startIgnore();
  Entry.projectId = b._id;
  Entry.variableContainer.setVariables(b.variables);
  Entry.variableContainer.setMessages(b.messages);
  Entry.scene.addScenes(b.scenes);
  Entry.stage.initObjectContainers();
  Entry.variableContainer.setFunctions(b.functions);
  Entry.container.setObjects(b.objects);
  Entry.FPS = b.speed ? b.speed : 60;
  createjs.Ticker.setFPS(Entry.FPS);
  "workspace" == this.type && setTimeout(function() {
    Entry.stateManager.endIgnore();
  }, 300);
  Entry.engine.projectTimer || Entry.variableContainer.generateTimer();
  0 === Object.keys(Entry.container.inputValue).length && Entry.variableContainer.generateAnswer();
  Entry.start();
  Entry.Loader.isLoaded() && Entry.Loader.handleLoad();
  return b;
}, clearProject:function() {
  Entry.stop();
  Entry.projectId = null;
  Entry.variableContainer.clear();
  Entry.container.clear();
  Entry.scene.clear();
}, exportProject:function(b) {
  b || (b = {});
  Entry.engine.isState("stop") || Entry.engine.toggleStop();
  Entry.Func && Entry.Func.workspace && Entry.Func.workspace.visible && Entry.Func.cancelEdit();
  b.objects = Entry.container.toJSON();
  b.scenes = Entry.scene.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.functions = Entry.variableContainer.getFunctionJSON();
  b.scenes = Entry.scene.toJSON();
  b.speed = Entry.FPS;
  return b;
}, setBlockByText:function(b, a) {
  for (var d = [], c = jQuery.parseXML(a).getElementsByTagName("category"), e = 0;e < c.length;e++) {
    for (var f = c[e], g = {category:f.getAttribute("id"), blocks:[]}, f = f.childNodes, h = 0;h < f.length;h++) {
      var k = f[h];
      !k.tagName || "BLOCK" != k.tagName.toUpperCase() && "BTN" != k.tagName.toUpperCase() || g.blocks.push(k.getAttribute("type"));
    }
    d.push(g);
  }
  Entry.playground.setBlockMenu(d);
}, setBlock:function(b, a) {
  Entry.playground.setMenuBlock(b, a);
}, enableArduino:function() {
}, initSound:function(b) {
  b.path = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/" + b.filename + b.ext;
  Entry.soundQueue.loadFile({id:b.id, src:b.path, type:createjs.LoadQueue.SOUND});
}, beforeUnload:function(b) {
  Entry.hw.closeConnection();
  Entry.variableContainer.updateCloudVariables();
  if ("workspace" == Entry.type && (localStorage && Entry.interfaceState && localStorage.setItem("workspace-interface", JSON.stringify(Entry.interfaceState)), !Entry.stateManager.isSaved())) {
    return Lang.Workspace.project_changed;
  }
}, loadInterfaceState:function() {
  if ("workspace" == Entry.type) {
    if (localStorage && localStorage.getItem("workspace-interface")) {
      var b = localStorage.getItem("workspace-interface");
      this.resizeElement(JSON.parse(b));
    } else {
      this.resizeElement({menuWidth:280, canvasWidth:480});
    }
  }
}, resizeElement:function(b) {
  if ("workspace" == Entry.type) {
    var a = this.interfaceState;
    !b.canvasWidth && a.canvasWidth && (b.canvasWidth = a.canvasWidth);
    !b.menuWidth && this.interfaceState.menuWidth && (b.menuWidth = a.menuWidth);
    Entry.engine.speedPanelOn && Entry.engine.toggleSpeedPanel();
    (a = b.canvasWidth) ? 325 > a ? a = 325 : 720 < a && (a = 720) : a = 400;
    b.canvasWidth = a;
    var d = 9 * a / 16;
    Entry.engine.view_.style.width = a + "px";
    Entry.engine.view_.style.height = d + "px";
    Entry.engine.view_.style.top = "40px";
    Entry.stage.canvas.canvas.style.width = a + "px";
    400 <= a ? Entry.engine.view_.removeClass("collapsed") : Entry.engine.view_.addClass("collapsed");
    Entry.playground.view_.style.left = a + .5 + "px";
    Entry.propertyPanel.resize(a);
    var c = Entry.engine.view_.getElementsByClassName("entryAddButtonWorkspace_w")[0];
    c && (Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.width = .7 * a + "px") : c.style.display = "none");
    if (c = Entry.engine.view_.getElementsByClassName("entryRunButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.left = .7 * a + "px", c.style.width = .3 * a + "px") : (c.style.left = "2px", c.style.top = d + 24 + "px", c.style.width = a - 4 + "px");
    }
    if (c = Entry.engine.view_.getElementsByClassName("entryStopButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.left = .7 * a + "px", c.style.width = .3 * a + "px") : (c.style.left = "2px", c.style.top = d + 24 + "px", c.style.width = a + "px");
    }
    (a = b.menuWidth) ? 244 > a ? a = 244 : 400 < a && (a = 400) : a = 264;
    b.menuWidth = a;
    $(".blockMenuContainer").css({width:a - 64 + "px"});
    $(".blockMenuContainer>svg").css({width:a - 64 + "px"});
    Entry.playground.mainWorkspace.blockMenu.setWidth();
    $(".entryWorkspaceBoard").css({left:a + "px"});
    Entry.playground.resizeHandle_.style.left = a + "px";
    Entry.playground.variableViewWrapper_.style.width = a + "px";
    this.interfaceState = b;
  }
  Entry.windowResized.notify();
}, getUpTime:function() {
  return (new Date).getTime() - this.startTime;
}, addActivity:function(b) {
  Entry.stateManager && Entry.stateManager.addActivity(b);
}, startActivityLogging:function() {
  Entry.reporter && Entry.reporter.start(Entry.projectId, window.user ? window.user._id : null, Entry.startTime);
}, getActivityLog:function() {
  var b = {};
  Entry.stateManager && (b.activityLog = Entry.stateManager.activityLog_);
  return b;
}, DRAG_MODE_NONE:0, DRAG_MODE_MOUSEDOWN:1, DRAG_MODE_DRAG:2, cancelObjectEdit:function(b) {
  var a = Entry.playground.object;
  if (a) {
    var d = b.target, c = 0 !== $(a.view_).find(d).length, d = d.tagName.toUpperCase();
    b = b.type;
    !a.isEditing || "INPUT" === d && c || "touchstart" === b || a.editObjectValues(!1);
  }
}, generateFunctionSchema:function(b) {
  b = "func_" + b;
  if (!Entry.block[b]) {
    var a = function() {
    };
    a.prototype = Entry.block.function_general;
    a = new a;
    a.changeEvent = new Entry.Event;
    a.template = Lang.template.function_general;
    Entry.block[b] = a;
  }
}, getMainWS:function() {
  var b;
  Entry.mainWorkspace ? b = Entry.mainWorkspace : Entry.playground && Entry.playground.mainWorkspace && (b = Entry.playground.mainWorkspace);
  return b;
}};
window.Entry = Entry;
Entry.Albert = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, leftEye:0, rightEye:0, note:0, bodyLed:0, frontLed:0, padWidth:0, padHeight:0}, setZero:function() {
  var b = Entry.Albert.PORT_MAP, a = Entry.hw.sendQueue, d;
  for (d in b) {
    a[d] = b[d];
  }
  Entry.hw.update();
  b = Entry.Albert;
  b.tempo = 60;
  b.removeAllTimeouts();
}, monitorTemplate:{imgPath:"hw/albert.png", width:387, height:503, listPorts:{temperature:{name:Lang.Blocks.ALBERT_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.ALBERT_sensor_acceleration_x, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.ALBERT_sensor_acceleration_y, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.ALBERT_sensor_acceleration_z, type:"input", pos:{x:0, y:0}}, frontOid:{name:Lang.Blocks.ALBERT_sensor_front_oid, type:"input", 
pos:{x:0, y:0}}, backOid:{name:Lang.Blocks.ALBERT_sensor_back_oid, type:"input", pos:{x:0, y:0}}, positionX:{name:Lang.Blocks.ALBERT_sensor_position_x, type:"input", pos:{x:0, y:0}}, positionY:{name:Lang.Blocks.ALBERT_sensor_position_y, type:"input", pos:{x:0, y:0}}, orientation:{name:Lang.Blocks.ALBERT_sensor_orientation, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.ALBERT_sensor_left_proximity, 
type:"input", pos:{x:178, y:401}}, rightProximity:{name:Lang.Blocks.ALBERT_sensor_right_proximity, type:"input", pos:{x:66, y:359}}, battery:{name:Lang.Blocks.ALBERT_sensor_battery, type:"input", pos:{x:88, y:368}}, light:{name:Lang.Blocks.ALBERT_sensor_light, type:"input", pos:{x:127, y:391}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:299, y:406}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:22, y:325}}, leftEye:{name:Lang.Hw.leftEye, type:"output", pos:{x:260, y:26}}, 
rightEye:{name:Lang.Hw.rightEye, type:"output", pos:{x:164, y:13}}, bodyLed:{name:Lang.Hw.body + " " + Lang.Hw.led_en, type:"output", pos:{x:367, y:308}}, frontLed:{name:Lang.Hw.front + " " + Lang.Hw.led_en, pos:{x:117, y:410}}}, mode:"both"}, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, controller:{PI:3.14159265, PI2:6.2831853, prevDirection:0, prevDirectionFine:0, directionFineCount:0, positionCount:0, finalPositionCount:0, GAIN_ANGLE:30, GAIN_ANGLE_FINE:30, GAIN_POSITION_FINE:30, STRAIGHT_SPEED:20, MAX_BASE_SPEED:20, GAIN_BASE_SPEED:1, GAIN_POSITION:35, POSITION_TOLERANCE_FINE:3, POSITION_TOLERANCE_FINE_LARGE:5, POSITION_TOLERANCE_ROUGH:5, POSITION_TOLERANCE_ROUGH_LARGE:10, ORIENTATION_TOLERANCE_FINE:.08, ORIENTATION_TOLERANCE_ROUGH:.09, ORIENTATION_TOLERANCE_ROUGH_LARGE:.18, 
MINIMUM_WHEEL_SPEED:18, MINIMUM_WHEEL_SPEED_FINE:15, clear:function() {
  this.finalPositionCount = this.positionCount = this.directionFineCount = this.prevDirectionFine = this.prevDirection = 0;
}, controlAngleFine:function(b, a) {
  var d = Entry.hw.sendQueue, c = this.validateRadian(a - b), e = Math.abs(c);
  if (e < this.ORIENTATION_TOLERANCE_FINE) {
    return !1;
  }
  var f = 0 < c ? 1 : -1;
  if (0 > f * this.prevDirectionFine && 5 < ++this.directionFineCount) {
    return !1;
  }
  this.prevDirectionFine = f;
  f = 0;
  0 < c ? (f = Math.log(1 + e) * this.GAIN_ANGLE_FINE, f < this.MINIMUM_WHEEL_SPEED && (f = this.MINIMUM_WHEEL_SPEED)) : (f = -Math.log(1 + e) * this.GAIN_ANGLE_FINE, f > -this.MINIMUM_WHEEL_SPEED && (f = -this.MINIMUM_WHEEL_SPEED));
  f = parseInt(f);
  d.leftWheel = -f;
  d.rightWheel = f;
  return !0;
}, controlAngle:function(b, a) {
  var d = Entry.hw.sendQueue, c = this.validateRadian(a - b), e = Math.abs(c);
  if (e < this.ORIENTATION_TOLERANCE_ROUGH) {
    return !1;
  }
  var f = 0 < c ? 1 : -1;
  if (e < this.ORIENTATION_TOLERANCE_ROUGH_LARGE && 0 > f * this.prevDirection) {
    return !1;
  }
  this.prevDirection = f;
  f = 0;
  0 < c ? (f = Math.log(1 + e) * this.GAIN_ANGLE, f < this.MINIMUM_WHEEL_SPEED && (f = this.MINIMUM_WHEEL_SPEED)) : (f = -Math.log(1 + e) * this.GAIN_ANGLE, f > -this.MINIMUM_WHEEL_SPEED && (f = -this.MINIMUM_WHEEL_SPEED));
  f = parseInt(f);
  d.leftWheel = -f;
  d.rightWheel = f;
  return !0;
}, controlPositionFine:function(b, a, d, c, e) {
  var f = Entry.hw.sendQueue;
  d = this.validateRadian(Math.atan2(e - a, c - b) - d);
  var g = Math.abs(d);
  b = c - b;
  a = e - a;
  a = Math.sqrt(b * b + a * a);
  if (a < this.POSITION_TOLERANCE_FINE) {
    return !1;
  }
  if (a < this.POSITION_TOLERANCE_FINE_LARGE && 5 < ++this.finalPositionCount) {
    return this.finalPositionCount = 0, !1;
  }
  a = 0;
  a = 0 < d ? Math.log(1 + g) * this.GAIN_POSITION_FINE : -Math.log(1 + g) * this.GAIN_POSITION_FINE;
  a = parseInt(a);
  f.leftWheel = this.MINIMUM_WHEEL_SPEED_FINE - a;
  f.rightWheel = this.MINIMUM_WHEEL_SPEED_FINE + a;
  return !0;
}, controlPosition:function(b, a, d, c, e) {
  var f = Entry.hw.sendQueue;
  d = this.validateRadian(Math.atan2(e - a, c - b) - d);
  var g = Math.abs(d);
  b = c - b;
  a = e - a;
  a = Math.sqrt(b * b + a * a);
  if (a < this.POSITION_TOLERANCE_ROUGH) {
    return !1;
  }
  if (a < this.POSITION_TOLERANCE_ROUGH_LARGE) {
    if (10 < ++this.positionCount) {
      return this.positionCount = 0, !1;
    }
  } else {
    this.positionCount = 0;
  }
  .01 > g ? (f.leftWheel = this.STRAIGHT_SPEED, f.rightWheel = this.STRAIGHT_SPEED) : (a = (this.MINIMUM_WHEEL_SPEED + .5 / g) * this.GAIN_BASE_SPEED, a > this.MAX_BASE_SPEED && (a = this.MAX_BASE_SPEED), e = 0, e = 0 < d ? Math.log(1 + g) * this.GAIN_POSITION : -Math.log(1 + g) * this.GAIN_POSITION, a = parseInt(a), e = parseInt(e), f.leftWheel = a - e, f.rightWheel = a + e);
  return !0;
}, validateRadian:function(b) {
  return b > this.PI ? b - this.PI2 : b < -this.PI ? b + this.PI2 : b;
}, toRadian:function(b) {
  return 3.14159265 * b / 180;
}}, name:"albert"};
Blockly.Blocks.albert_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_hand_found = function(b, a) {
  var d = Entry.hw.portData;
  return 40 < d.leftProximity || 40 < d.rightProximity;
};
Blockly.Blocks.albert_is_oid_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_is_oid_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_front_oid, "FRONT"], [Lang.Blocks.ALBERT_back_oid, "BACK"]]), "OID").appendField(Lang.Blocks.ALBERT_is_oid_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_is_oid_3);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_is_oid_value = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("OID", a), e = a.getNumberValue("VALUE");
  return "FRONT" == c ? d.frontOid == e : d.backOid == e;
};
Blockly.Blocks.albert_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_sensor_left_proximity, "leftProximity"], [Lang.Blocks.ALBERT_sensor_right_proximity, "rightProximity"], [Lang.Blocks.ALBERT_sensor_acceleration_x, "accelerationX"], [Lang.Blocks.ALBERT_sensor_acceleration_y, "accelerationY"], [Lang.Blocks.ALBERT_sensor_acceleration_z, "accelerationZ"], [Lang.Blocks.ALBERT_sensor_front_oid, "frontOid"], [Lang.Blocks.ALBERT_sensor_back_oid, "backOid"], [Lang.Blocks.ALBERT_sensor_position_x, 
  "positionX"], [Lang.Blocks.ALBERT_sensor_position_y, "positionY"], [Lang.Blocks.ALBERT_sensor_orientation, "orientation"], [Lang.Blocks.ALBERT_sensor_light, "light"], [Lang.Blocks.ALBERT_sensor_temperature, "temperature"], [Lang.Blocks.ALBERT_sensor_battery, "battery"], [Lang.Blocks.ALBERT_sensor_signal_strength, "signalStrength"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.albert_value = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.albert_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = 30;
  d.rightWheel = 30;
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, d);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = -30;
  d.rightWheel = -30;
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, d);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_left, "LEFT"], [Lang.Blocks.ALBERT_turn_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (d.leftWheel = -30, d.rightWheel = 30) : (d.leftWheel = 30, d.rightWheel = -30);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, d);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_both_wheels_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + c : c;
  d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e;
  return a.callReturn();
};
Blockly.Blocks.albert_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_both_wheels_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = a.getNumberValue("LEFT");
  d.rightWheel = a.getNumberValue("RIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_wheel, "LEFT"], [Lang.Blocks.ALBERT_right_wheel, "RIGHT"], [Lang.Blocks.ALBERT_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheel_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e : ("RIGHT" != c && (d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e), d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e);
  return a.callReturn();
};
Blockly.Blocks.albert_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_wheel, "LEFT"], [Lang.Blocks.ALBERT_right_wheel, "RIGHT"], [Lang.Blocks.ALBERT_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheel_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = e : ("RIGHT" != c && (d.leftWheel = e), d.rightWheel = e);
  return a.callReturn();
};
Blockly.Blocks.albert_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_stop = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = 0;
  d.rightWheel = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_pad_size_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_1);
  this.appendValueInput("WIDTH").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_2);
  this.appendValueInput("HEIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_pad_size_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.padWidth = a.getNumberValue("WIDTH");
  d.padHeight = a.getNumberValue("HEIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_move_to_x_y_on_board = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_1);
  this.appendValueInput("X").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_2);
  this.appendValueInput("Y").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_to_x_y_on_board = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData, e = Entry.Albert.controller;
  if (a.isStart) {
    if (a.isMoving) {
      0 <= c.positionX && (a.x = c.positionX);
      0 <= c.positionY && (a.y = c.positionY);
      a.theta = c.orientation;
      switch(a.boardState) {
        case 1:
          if (0 == a.initialized) {
            if (0 > a.x || 0 > a.y) {
              d.leftWheel = 20;
              d.rightWheel = -20;
              break;
            }
            a.initialized = !0;
          }
          d = e.toRadian(a.theta);
          0 == e.controlAngle(d, Math.atan2(a.targetY - a.y, a.targetX - a.x)) && (a.boardState = 2);
          break;
        case 2:
          0 == e.controlPosition(a.x, a.y, e.toRadian(a.theta), a.targetX, a.targetY) && (a.boardState = 3);
          break;
        case 3:
          0 == e.controlPositionFine(a.x, a.y, e.toRadian(a.theta), a.targetX, a.targetY) && (d.leftWheel = 0, d.rightWheel = 0, a.isMoving = !1);
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.initialized;
    delete a.boardState;
    delete a.x;
    delete a.y;
    delete a.theta;
    delete a.targetX;
    delete a.targetY;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.initialized = !1;
  a.boardState = 1;
  a.x = -1;
  a.y = -1;
  a.theta = -200;
  a.targetX = a.getNumberValue("X");
  a.targetY = a.getNumberValue("Y");
  e.clear();
  d.leftWheel = 0;
  d.rightWheel = 0;
  return a;
};
Blockly.Blocks.albert_set_orientation_on_board = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_orientation_to_1);
  this.appendValueInput("ORIENTATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_orientation_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_orientation_on_board = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData, e = Entry.Albert.controller;
  if (a.isStart) {
    if (a.isMoving) {
      a.theta = c.orientation;
      switch(a.boardState) {
        case 1:
          var c = e.toRadian(a.theta), f = e.toRadian(a.targetTheta);
          0 == e.controlAngle(c, f) && (a.boardState = 2);
          break;
        case 2:
          c = e.toRadian(a.theta), f = e.toRadian(a.targetTheta), 0 == e.controlAngleFine(c, f) && (d.leftWheel = 0, d.rightWheel = 0, a.isMoving = !1);
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.boardState;
    delete a.theta;
    delete a.targetTheta;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.boardState = 1;
  a.theta = -200;
  a.targetTheta = a.getNumberValue("ORIENTATION");
  e.clear();
  d.leftWheel = 0;
  d.rightWheel = 0;
  return a;
};
Blockly.Blocks.albert_set_eye_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_eye_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_eye, "LEFT"], [Lang.Blocks.ALBERT_right_eye, "RIGHT"], [Lang.Blocks.ALBERT_both_eyes, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_eye_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.ALBERT_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.ALBERT_color_magenta, 
  "5"], [Lang.Blocks.ALBERT_color_white, "7"]]), "COLOR").appendField(Lang.Blocks.ALBERT_set_eye_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_eye_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "LEFT" == c ? d.leftEye = e : ("RIGHT" != c && (d.leftEye = e), d.rightEye = e);
  return a.callReturn();
};
Blockly.Blocks.albert_clear_eye = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_eye_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_eye, "LEFT"], [Lang.Blocks.ALBERT_right_eye, "RIGHT"], [Lang.Blocks.ALBERT_both_eyes, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_eye_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_eye = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a);
  "LEFT" == c ? d.leftEye = 0 : ("RIGHT" != c && (d.leftEye = 0), d.rightEye = 0);
  return a.callReturn();
};
Blockly.Blocks.albert_body_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_body_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_on, "ON"], [Lang.Blocks.ALBERT_turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_turn_body_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_body_led = function(b, a) {
  var d = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? d.bodyLed = 1 : d.bodyLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_front_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_front_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_on, "ON"], [Lang.Blocks.ALBERT_turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_turn_front_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_front_led = function(b, a) {
  var d = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? d.frontLed = 1 : d.frontLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_beep = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 440;
  d.note = 0;
  var c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, 200);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_buzzer_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("VALUE");
  d.buzzer = void 0 != d.buzzer ? d.buzzer + c : c;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_buzzer_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = a.getNumberValue("VALUE");
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_buzzer = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = 0;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.ALBERT_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.ALBERT_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_play_note_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return a.callReturn();
  }
  var c = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Albert.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 0;
  d.note = c + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      d.note = 0;
      Entry.Albert.removeTimeout(h);
    }, f - 100);
    Entry.Albert.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(k);
  }, f);
  Entry.Albert.timeouts.push(k);
  return a;
};
Blockly.Blocks.albert_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_rest_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var c = a.getNumberValue("VALUE"), c = 6E4 * c / Entry.Albert.tempo;
  d.buzzer = 0;
  d.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(e);
  }, c);
  Entry.Albert.timeouts.push(e);
  return a;
};
Blockly.Blocks.albert_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_tempo_by = function(b, a) {
  Entry.Albert.tempo += a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.albert_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_tempo_to = function(b, a) {
  Entry.Albert.tempo = a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Entry.Arduino = {name:"arduino", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0;20 > b;b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/arduino.png", width:605, height:434, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.ArduinoExt = {name:"ArduinoExt", setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.SET[b].time = (new Date).getTime();
  }) : Entry.hw.sendQueue = {GET:{}, SET:{}};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, SERVO_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8}, toneMap:{1:[33, 65, 131, 262, 523, 1046, 2093, 4186], 2:[35, 69, 139, 277, 554, 1109, 2217, 4435], 3:[37, 73, 147, 294, 587, 1175, 2349, 4699], 4:[39, 78, 156, 311, 622, 1245, 2849, 4978], 5:[41, 82, 165, 330, 659, 1319, 2637, 5274], 6:[44, 87, 175, 349, 698, 1397, 2794, 5588], 7:[46, 92, 185, 370, 740, 1480, 2960, 5920], 8:[49, 98, 196, 392, 784, 1568, 3136, 6272], 9:[52, 104, 208, 415, 831, 
1661, 3322, 6645], 10:[55, 110, 220, 440, 880, 1760, 3520, 7040], 11:[58, 117, 233, 466, 932, 1865, 3729, 7459], 12:[62, 123, 247, 494, 988, 1976, 3951, 7902]}, BlockState:{}};
Entry.SmartBoard = {name:"smartBoard", setZero:Entry.Arduino.setZero};
Entry.SensorBoard = {name:"sensorBoard", setZero:Entry.Arduino.setZero};
Entry.ardublock = {name:"ardublock", setZero:Entry.Arduino.setZero};
Entry.dplay = {name:"dplay", vel_value:255, Left_value:255, Right_value:255, setZero:Entry.Arduino.setZero, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, monitorTemplate:{imgPath:"hw/dplay.png", width:500, height:600, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.nemoino = {name:"nemoino", setZero:Entry.Arduino.setZero};
Entry.joystick = {name:"joystick", setZero:Entry.Arduino.setZero};
Entry.CODEino = {name:"CODEino", getSensorKey:function() {
  return "xxxxxxxx".replace(/[xy]/g, function(b) {
    var a = 16 * Math.random() | 0;
    return ("x" == b ? a : a & 0 | 0).toString(16);
  }).toUpperCase();
}, getSensorTime:function(b) {
  return (new Date).getTime() + b;
}, monitorTemplate:Entry.Arduino.monitorTemplate, setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(b) {
    Entry.hw.sendQueue.SET[b].data = 0;
    Entry.hw.sendQueue.TIME = Entry.CODEino.getSensorTime(Entry.hw.sendQueue.SET[b].type);
    Entry.hw.sendQueue.KEY = Entry.CODEino.getSensorKey();
  }) : Entry.hw.sendQueue = {SET:{0:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 1:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 2:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 3:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 4:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 5:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 6:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 7:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 8:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 
  9:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 10:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 11:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 12:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 13:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}}, TIME:Entry.CODEino.getSensorTime(Entry.CODEino.sensorTypes.DIGITAL), KEY:Entry.CODEino.getSensorKey()};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, RGBLED_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8, ADDCOLOR:9}, BlockState:{}};
Blockly.Blocks.arduino_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("Arduino"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_text = function(b, a) {
  return a.getStringField("NAME");
};
Blockly.Blocks.arduino_send = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_send = function(b, a) {
  var d = a.getValue("VALUE", a), c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(d));
  Entry.assert(200 == c.status, "arduino is not connected");
  return a.callReturn();
};
Blockly.Blocks.arduino_get_string = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_2);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_number = function(b, a) {
  var d = a.getValue("VALUE", a), c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(d));
  Entry.assert(200 == c.status, "arduino is not connected");
  return Number(c.responseText);
};
Blockly.Blocks.arduino_get_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_string = function(b, a) {
  var d = a.getValue("VALUE", a), c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(d));
  Entry.assert(200 == c.status, "arduino is not connected");
  return c.responseText;
};
Blockly.Blocks.arduino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_arduino_get_sensor_number_0, "A0"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_1, "A1"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_2, "A2"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_3, "A3"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_4, "A4"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_5, "A5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_pwm_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_pwm_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_number_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.arduino_get_number_sensor_value = function(b, a) {
  var d = a.getValue("VALUE", a);
  return Entry.hw.getAnalogPortValue(d[1]);
};
Blockly.Blocks.arduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.arduino_get_digital_value = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  return Entry.hw.getDigitalPortValue(d);
};
Blockly.Blocks.arduino_toggle_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_led = function(b, a) {
  var d = a.getNumberValue("VALUE"), c = a.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(d, "on" == c ? 255 : 0);
  return a.callReturn();
};
Blockly.Blocks.arduino_toggle_pwm = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_1);
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_3);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_pwm = function(b, a) {
  var d = a.getNumberValue("PORT"), c = a.getNumberValue("VALUE"), c = Math.round(c), c = Math.max(c, 0), c = Math.min(c, 255);
  Entry.hw.setDigitalPortValue(d, c);
  return a.callReturn();
};
Blockly.Blocks.arduino_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_4);
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_6);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_convert_scale = function(b, a) {
  var d = a.getNumberValue("VALUE1", a), c = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (c > e) {
    var h = c, c = e, e = h
  }
  f > g && (h = f, f = g, g = h);
  d -= c;
  d *= (g - f) / (e - c);
  d += f;
  d = Math.min(g, d);
  d = Math.max(f, d);
  return Math.round(d);
};
Blockly.Blocks.sensorBoard_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\uc18c\ub9ac", "0"], ["\ube5b \uac10\uc9c0", "1"], ["\uc2ac\ub77c\uc774\ub354", "2"], ["\uc628\ub3c4", "3"]]), "PORT").appendField(" \uc13c\uc11c\uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.sensorBoard_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.sensorBoard_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "8"], ["\ud30c\ub780", "9"], ["\ub178\ub780", "10"], ["\ucd08\ub85d", "11"]]), "PORT");
  this.appendDummyInput().appendField(" \ubc84\ud2bc\uc744 \ub20c\ub800\ub294\uac00?");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.sensorBoard_is_button_pressed = function(b, a) {
  return Entry.hw.getDigitalPortValue(a.getNumberField("PORT", a));
};
Blockly.Blocks.sensorBoard_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "2"], ["\ucd08\ub85d", "3"], ["\ud30c\ub780", "4"], ["\ud770\uc0c9", "5"]]), "PORT").appendField(" LED").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "255"], ["\ub044\uae30", "0"]]), "OPERATOR").appendField(" ").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.sensorBoard_led = function(b, a) {
  Entry.hw.setDigitalPortValue(a.getField("PORT"), a.getNumberField("OPERATOR"));
  return a.callReturn();
};
Entry.block.arduino_download_connector = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download connector");
}]}};
Entry.block.download_guide = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \uc548\ub0b4 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download guide");
}]}};
Entry.block.arduino_download_source = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5d4\ud2b8\ub9ac \uc544\ub450\uc774\ub178 \uc18c\uc2a4", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_connected = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ub428", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_reconnect = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub2e4\uc2dc \uc5f0\uacb0\ud558\uae30", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Blockly.Blocks.CODEino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_get_sensor_number_0, "A0"], [Lang.Blocks.CODEino_get_sensor_number_1, "A1"], [Lang.Blocks.CODEino_get_sensor_number_2, "A2"], [Lang.Blocks.CODEino_get_sensor_number_3, "A3"], [Lang.Blocks.CODEino_get_sensor_number_4, "A4"], [Lang.Blocks.CODEino_get_sensor_number_5, "A5"], [Lang.Blocks.CODEino_get_sensor_number_6, "A6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.CODEino_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_sensor_name_0, "0"], [Lang.Blocks.CODEino_sensor_name_1, "1"], [Lang.Blocks.CODEino_sensor_name_2, "2"], [Lang.Blocks.CODEino_sensor_name_3, "3"], [Lang.Blocks.CODEino_sensor_name_4, "4"], [Lang.Blocks.CODEino_sensor_name_5, "5"], [Lang.Blocks.CODEino_sensor_name_6, "6"]]), "PORT").appendField(Lang.Blocks.CODEino_string_1);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.CODEino_get_sound_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_10).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_11, "GREAT"], [Lang.Blocks.CODEino_string_12, "SMALL"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_sound_status = function(b, a) {
  return "GREAT" == a.getField("STATUS", a) ? 600 < Entry.hw.getAnalogPortValue(0) ? 1 : 0 : 600 > Entry.hw.getAnalogPortValue(0) ? 1 : 0;
};
Blockly.Blocks.CODEino_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_13).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_14, "BRIGHT"], [Lang.Blocks.CODEino_string_15, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_light_status = function(b, a) {
  return "DARK" == a.getField("STATUS", a) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.CODEino_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_3, "4"], [Lang.Blocks.CODEino_string_4, "17"], [Lang.Blocks.CODEino_string_5, "18"], [Lang.Blocks.CODEino_string_6, "19"], [Lang.Blocks.CODEino_string_7, "20"]]), "PORT").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_is_button_pressed = function(b, a) {
  var d = a.getNumberField("PORT", a);
  return 14 < d ? !Entry.hw.getAnalogPortValue(d - 14) : !Entry.hw.getDigitalPortValue(d);
};
Blockly.Blocks.CODEino_get_accelerometer_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_16, "LEFT"], [Lang.Blocks.CODEino_string_17, "RIGHT"], [Lang.Blocks.CODEino_string_18, "FRONT"], [Lang.Blocks.CODEino_string_19, "REAR"], [Lang.Blocks.CODEino_string_20, "REVERSE"]]), "DIRECTION");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_accelerometer_direction = function(b, a) {
  var d = a.getField("DIRECTION", a), c = 0;
  "LEFT" == d || "RIGHT" == d ? c = 3 : "FRONT" == d || "REAR" == d ? c = 4 : "REVERSE" == d && (c = 5);
  c = Entry.hw.getAnalogPortValue(c);
  c = 180 / 137 * (c - 265);
  c += -90;
  c = Math.min(90, c);
  c = Math.max(-90, c);
  c = Math.round(c);
  if ("LEFT" == d || "REAR" == d) {
    return -30 > c ? 1 : 0;
  }
  if ("RIGHT" == d || "FRONT" == d) {
    return 30 < c ? 1 : 0;
  }
  if ("REVERSE" == d) {
    return -50 > c ? 1 : 0;
  }
};
Blockly.Blocks.CODEino_get_accelerometer_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_accelerometer_X, "3"], [Lang.Blocks.CODEino_accelerometer_Y, "4"], [Lang.Blocks.CODEino_accelerometer_Z, "5"]]), "PORT").appendField(Lang.Blocks.CODEino_string_9);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_accelerometer_value = function(b, a) {
  var d = 265, c = 402, e = -90, f = 90, g = Entry.hw.getAnalogPortValue(a.getField("PORT", a));
  if (d > c) {
    var h = d, d = c, c = h
  }
  e > f && (h = e, e = f, f = h);
  g = (f - e) / (c - d) * (g - d);
  g += e;
  g = Math.min(f, g);
  g = Math.max(e, g);
  return Math.round(g);
};
Blockly.Blocks.dplay_select_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_select_led = function(b, a) {
  var d = a.getField("PORT"), c = 7;
  "7" == d ? c = 7 : "8" == d ? c = 8 : "9" == d ? c = 9 : "10" == d && (c = 10);
  d = a.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(c, "on" == d ? 255 : 0);
  return a.callReturn();
};
Blockly.Blocks.dplay_get_switch_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub514\uc9c0\ud138 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["4", "4"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_5, "ON"], [Lang.Blocks.dplay_string_6, "OFF"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_switch_status = function(b, a) {
  var d = a.getField("PORT"), c = 2;
  "2" == d ? c = 2 : "4" == d && (c = 4);
  return "OFF" == a.getField("STATUS") ? 1 == Entry.hw.getDigitalPortValue(c) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(c) ? 1 : 0;
};
Blockly.Blocks.dplay_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_light).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_3, "BRIGHT"], [Lang.Blocks.dplay_string_4, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_light_status = function(b, a) {
  return "DARK" == a.getField("STATUS", a) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.dplay_get_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uac00\ubcc0\uc800\ud56d", "ADJU"], ["\ube5b\uc13c\uc11c", "LIGHT"], ["\uc628\ub3c4\uc13c\uc11c", "TEMP"], ["\uc870\uc774\uc2a4\ud2f1 X", "JOYS"], ["\uc870\uc774\uc2a4\ud2f1 Y", "JOYS"], ["\uc801\uc678\uc120", "INFR"]]), "OPERATOR");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_5);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.dplay_get_value = function(b, a) {
  var d = a.getValue("VALUE", a);
  return Entry.hw.getAnalogPortValue(d[1]);
};
Blockly.Blocks.dplay_get_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_tilt).appendField(new Blockly.FieldDropdown([["\uc67c\ucabd \uae30\uc6b8\uc784", "LEFT"], ["\uc624\ub978\ucabd \uae30\uc6b8\uc784", "LIGHT"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_tilt = function(b, a) {
  return "LIGHT" == a.getField("STATUS", a) ? 1 == Entry.hw.getDigitalPortValue(12) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(12) ? 1 : 0;
};
Blockly.Blocks.dplay_DCmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc67c\ucabd", "3"], ["\uc624\ub978\ucabd", "6"]]), "PORT");
  this.appendDummyInput().appendField(" DC\ubaa8\ud130 \uc0c1\ud0dc\ub97c");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc815\ubc29\ud5a5", "FRONT"], ["\uc5ed\ubc29\ud5a5", "REAR"], ["\uc815\uc9c0", "OFF"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_DCmotor = function(b, a) {
  var d = a.getField("PORT"), c = 0;
  "3" == d ? c = 5 : "6" == d && (c = 11);
  var e = a.getField("OPERATOR"), f = 0, g = 0;
  "FRONT" == e ? (f = 255, g = 0) : "REAR" == e ? (f = 0, g = 255) : "OFF" == e && (g = f = 0);
  Entry.hw.setDigitalPortValue(d, f);
  Entry.hw.setDigitalPortValue(c, g);
  return a.callReturn();
};
Blockly.Blocks.dplay_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubd80\uc800\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\ub3c4", "1"], ["\ub808", "2"], ["\ubbf8", "3"]]), "PORT");
  this.appendDummyInput().appendField("\ub85c");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc15\uc790\ub85c \uc5f0\uc8fc\ud558\uae30");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_buzzer = function(b, a) {
  var d = a.getField("PORT"), c = 2;
  "1" == d ? c = 2 : "2" == d ? c = 4 : "3" == d && (c = 7);
  d = a.getNumberValue("VALUE");
  d = Math.round(d);
  d = Math.max(d, 0);
  d = Math.min(d, 100);
  Entry.hw.setDigitalPortValue(c, d);
  return a.callReturn();
};
Blockly.Blocks.dplay_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4\ubaa8\ud130 \uac01\ub3c4\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc774\ub3d9");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_servo = function(b, a) {
  var d = a.getNumberValue("VALUE"), d = Math.round(d), d = Math.max(d, 0), d = Math.min(d, 180);
  Entry.hw.setDigitalPortValue(9, d);
  return a.callReturn();
};
Entry.Bitbrick = {SENSOR_MAP:{1:"light", 2:"IR", 3:"touch", 4:"potentiometer", 5:"MIC", 21:"UserSensor", 11:"UserInput", 20:"LED", 19:"SERVO", 18:"DC"}, PORT_MAP:{buzzer:2, 5:4, 6:6, 7:8, 8:10, LEDR:12, LEDG:14, LEDB:16}, sensorList:function() {
  for (var b = [], a = Entry.hw.portData, d = 1;5 > d;d++) {
    var c = a[d];
    c && (c.value || 0 === c.value) && b.push([d + " - " + Lang.Blocks["BITBRICK_" + c.type], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, touchList:function() {
  for (var b = [], a = Entry.hw.portData, d = 1;5 > d;d++) {
    var c = a[d];
    c && "touch" === c.type && b.push([d.toString(), d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, servoList:function() {
  for (var b = [], a = Entry.hw.portData, d = 5;9 > d;d++) {
    var c = a[d];
    c && "SERVO" === c.type && b.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, dcList:function() {
  for (var b = [], a = Entry.hw.portData, d = 5;9 > d;d++) {
    var c = a[d];
    c && "DC" === c.type && b.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, setZero:function() {
  var b = Entry.hw.sendQueue, a;
  for (a in Entry.Bitbrick.PORT_MAP) {
    b[a] = 0;
  }
  Entry.hw.update();
}, name:"bitbrick", servoMaxValue:181, servoMinValue:1, dcMaxValue:100, dcMinValue:-100, monitorTemplate:{keys:["value"], imgPath:"hw/bitbrick.png", width:400, height:400, listPorts:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, 
y:0}}, A:{name:Lang.Hw.port_en + " A " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, B:{name:Lang.Hw.port_en + " B " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, C:{name:Lang.Hw.port_en + " C " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, D:{name:Lang.Hw.port_en + " D " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.bitbrick_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT").appendField(" \uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_sensor_value = function(b, a) {
  var d = a.getStringField("PORT");
  return Entry.hw.portData[d].value;
};
Blockly.Blocks.bitbrick_is_touch_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.BITBRICK_touch).appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.touchList), "PORT").appendField("\uc774(\uac00) \ub20c\ub838\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_is_touch_pressed = function(b, a) {
  return 0 === Entry.hw.portData[a.getStringField("PORT")].value;
};
Blockly.Blocks.bitbrick_turn_off_color_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_color_led = function(b, a) {
  Entry.hw.sendQueue.LEDR = 0;
  Entry.hw.sendQueue.LEDG = 0;
  Entry.hw.sendQueue.LEDB = 0;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_rgb = function(b, a) {
  var d = a.getNumberValue("rValue"), c = a.getNumberValue("gValue"), e = a.getNumberValue("bValue"), f = Entry.adjustValueWithMaxMin, g = Entry.hw.sendQueue;
  g.LEDR = f(d, 0, 255);
  g.LEDG = f(c, 0, 255);
  g.LEDB = f(e, 0, 255);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \uc0c9 ").appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_picker = function(b, a) {
  var d = a.getStringField("VALUE");
  Entry.hw.sendQueue.LEDR = parseInt(d.substr(1, 2), 16);
  Entry.hw.sendQueue.LEDG = parseInt(d.substr(3, 2), 16);
  Entry.hw.sendQueue.LEDB = parseInt(d.substr(5, 2), 16);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 \uc0c9");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_value = function(b, a) {
  var d = a.getNumberValue("VALUE"), c, e, f, d = d % 200;
  67 > d ? (c = 200 - 3 * d, e = 3 * d, f = 0) : 134 > d ? (d -= 67, c = 0, e = 200 - 3 * d, f = 3 * d) : 201 > d && (d -= 134, c = 3 * d, e = 0, f = 200 - 3 * d);
  Entry.hw.sendQueue.LEDR = c;
  Entry.hw.sendQueue.LEDG = e;
  Entry.hw.sendQueue.LEDB = f;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\uc800\uc74c ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_buzzer = function(b, a) {
  if (a.isStart) {
    return Entry.hw.sendQueue.buzzer = 0, delete a.isStart, a.callReturn();
  }
  var d = a.getNumberValue("VALUE");
  Entry.hw.sendQueue.buzzer = d;
  a.isStart = !0;
  return a;
};
Blockly.Blocks.bitbrick_turn_off_all_motors = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ub4e0 \ubaa8\ud130 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_all_motors = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.Bitbrick;
  c.servoList().map(function(a) {
    d[a[1]] = 0;
  });
  c.dcList().map(function(a) {
    d[a[1]] = 128;
  });
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" \uc18d\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_speed = function(b, a) {
  var d = a.getNumberValue("VALUE"), d = Math.min(d, Entry.Bitbrick.dcMaxValue), d = Math.max(d, Entry.Bitbrick.dcMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = d + 128;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_direction_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.BITBRICK_dc_direction_cw, "CW"], [Lang.Blocks.BITBRICK_dc_direction_ccw, "CCW"]]), "DIRECTION").appendField(" \ubc29\ud5a5").appendField(" \uc18d\ub825");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_direction_speed = function(b, a) {
  var d = "CW" === a.getStringField("DIRECTION"), c = a.getNumberValue("VALUE"), c = Math.min(c, Entry.Bitbrick.dcMaxValue), c = Math.max(c, 0);
  Entry.hw.sendQueue[a.getStringField("PORT")] = d ? c + 128 : 128 - c;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_servomotor_angle = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4 \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.servoList), "PORT").appendField(" \uac01\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_servomotor_angle = function(b, a) {
  var d = a.getNumberValue("VALUE") + 1, d = Math.min(d, Entry.Bitbrick.servoMaxValue), d = Math.max(d, Entry.Bitbrick.servoMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = d;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubcc0\ud658");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT");
  this.appendDummyInput().appendField("\uac12");
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\uc5d0\uc11c");
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_convert_scale = function(b, a) {
  var d = a.getNumberField("PORT"), c = Entry.hw.portData[d].value, d = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (f > g) {
    var h = f, f = g, g = h
  }
  c -= d;
  c *= (g - f) / (e - d);
  c += f;
  c = Math.min(g, c);
  c = Math.max(f, c);
  return Math.round(c);
};
Entry.Cobl = {name:"cobl", setZero:function() {
  for (var b = 0;14 > b;b++) {
    Entry.hw.sendQueue[b] = 0;
  }
  Entry.hw.update();
}};
Blockly.Blocks.cobl_read_ultrason = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ucd08\uc74c\ud30c \uac70\ub9ac\uc7ac\uae30(0~400)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_ultrason = function(b, a) {
  return Entry.hw.getAnalogPortValue("ultrason");
};
Blockly.Blocks.cobl_read_potenmeter = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uac00\ubcc0\uc800\ud56d \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_potenmeter = function(b, a) {
  console.log("cobl_read_potenmeter");
  return Entry.hw.getAnalogPortValue("potenmeter");
};
Blockly.Blocks.cobl_read_irread1 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("IR1 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_irread1 = function(b, a) {
  return Entry.hw.getAnalogPortValue("potenmeter");
};
Blockly.Blocks.cobl_read_irread2 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("IR2 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_irread2 = function(b, a) {
  a.getValue("irread2", a);
  return Entry.hw.getAnalogPortValue("irread2");
};
Blockly.Blocks.cobl_read_joyx = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc870\uc774\uc2a4\ud2f1X\ucd95 \uc77d\uae30(1,0,-1)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_joyx = function(b, a) {
  return Entry.hw.getAnalogPortValue("joyx");
};
Blockly.Blocks.cobl_read_joyy = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc870\uc774\uc2a4\ud2f1Y\ucd95 \uc77d\uae30(1,0,-1)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_joyy = function(b, a) {
  return Entry.hw.getAnalogPortValue("joyy");
};
Blockly.Blocks.cobl_read_sens1 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc13c\uc11c1 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_sens1 = function(b, a) {
  return Entry.hw.getAnalogPortValue("sens1");
};
Blockly.Blocks.cobl_read_sens2 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc13c\uc11c2 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_sens2 = function(b, a) {
  return Entry.hw.getAnalogPortValue("sens2");
};
Blockly.Blocks.cobl_read_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uae30\uc6b8\uae30\uc13c\uc11c \uc77d\uae30(0~4)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_tilt = function(b, a) {
  return Entry.hw.getAnalogPortValue("tilt");
};
Blockly.Blocks.cobl_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.cobl_get_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.cobl_read_temps = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc628\ub3c4\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_temps = function(b, a) {
  var d = a.getValue("VALUE", a);
  if (1 == d) {
    return Entry.hw.getAnalogPortValue("temps1");
  }
  if (2 == d) {
    return Entry.hw.getAnalogPortValue("temps2");
  }
};
Blockly.Blocks.cobl_read_light = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc1d\uae30\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_light = function(b, a) {
  var d = a.getValue("VALUE", a);
  if (1 == d) {
    return Entry.hw.getAnalogPortValue("light1");
  }
  if (2 == d) {
    return Entry.hw.getAnalogPortValue("light2");
  }
};
Blockly.Blocks.cobl_read_btn = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\ud2bc\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.cobl_read_btn = function(b, a) {
  var d = a.getValue("VALUE", a);
  if (1 == d) {
    return Entry.hw.getDigitalPortValue("btn1");
  }
  if (2 == d) {
    return Entry.hw.getDigitalPortValue("btn2");
  }
};
Blockly.Blocks.cobl_led_control = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Rainbow LED");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OFF", "OFF"], ["Red", "Red"], ["Orange", "Orange"], ["Yellow", "Yellow"], ["Green", "Green"], ["Blue", "Blue"], ["Dark Blue", "Dark Blue"], ["Purple", "Purple"], ["White", "White"]]), "OPERATOR");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_led_control = function(b, a) {
  var d = a.getStringField("PORT"), c = a.getStringField("OPERATOR");
  Entry.hw.setDigitalPortValue("RainBowLED_IDX", d);
  Entry.hw.setDigitalPortValue("RainBowLED_COL", c);
  return a.callReturn();
};
Blockly.Blocks.cobl_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("cobl"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.cobl_text = function(b, a) {
  return a.getStringField("NAME");
};
Blockly.Blocks.cobl_servo_angle_control = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Servo");
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("Angle-");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(15~165)");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_servo_angle_control = function(b, a) {
  console.log("servo - test");
  var d = a.getNumberValue("PORT"), c = a.getNumberValue("VALUE"), c = Math.round(c), c = Math.max(c, 15), c = Math.min(c, 165);
  1 == d && (console.log("servo 1  degree " + c), Entry.hw.setDigitalPortValue("Servo1", c));
  2 == d && (console.log("servo 2 degree " + c), Entry.hw.setDigitalPortValue("Servo2", c));
  return a.callReturn();
};
Blockly.Blocks.cobl_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Melody");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["(Low)So", "L_So"], ["(Low)So#", "L_So#"], ["(Low)La", "L_La"], ["(Low)La#", "L_La#"], ["(Low)Ti", "L_Ti"], ["Do", "Do"], ["Do#", "Do#"], ["Re", "Re"], ["Re#", "Re#"], ["Mi", "Mi"], ["Fa", "Fa"], ["Fa#", "Fa#"], ["So", "So"], ["So#", "So#"], ["La", "La"], ["La#", "La#"], ["Ti", "Ti"], ["(High)Do", "H_Do"], ["(High)Do#", "H_Do#"], ["(High)Re", "H_Re"], ["(High)R2#", "H_Re#"], ["(High)Mi", "H_Mi"], ["(High)Fa", "H_Fa"]]), "MELODY");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_melody = function(b, a) {
  var d = a.getStringField("MELODY");
  console.log("cobl_melody" + d);
  Entry.hw.setDigitalPortValue("Melody", d);
  return a.callReturn();
};
Blockly.Blocks.cobl_dcmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DcMotor");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "MOTOR");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1.Clockwise", "1"], ["2.Counter Clockwise", "2"], ["3.Stop", "3"]]), "DIRECTION");
  this.appendDummyInput().appendField(" Speed");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "SPEED");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_dcmotor = function(b, a) {
  var d = a.getStringField("MOTOR"), c = a.getStringField("DIRECTION"), e = a.getStringField("SPEED");
  console.log("MOTOR" + d + "  Direction" + c + "  speed" + e);
  1 == d && (Entry.hw.setDigitalPortValue("DC1_DIR", c), Entry.hw.setDigitalPortValue("DC1_SPEED", e));
  2 == d && (Entry.hw.setDigitalPortValue("DC2_DIR", c), Entry.hw.setDigitalPortValue("DC2_SPEED", e));
  return a.callReturn();
};
Blockly.Blocks.cobl_extention_port = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Extention Port");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "PORT");
  this.appendDummyInput().appendField(" Level");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "LEVEL");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_extention_port = function(b, a) {
  var d = a.getStringField("PORT"), c = a.getStringField("LEVEL");
  1 == d && Entry.hw.setDigitalPortValue("EXUSB1", c);
  2 == d && Entry.hw.setDigitalPortValue("EXUSB2", c);
  return a.callReturn();
};
Blockly.Blocks.cobl_external_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("External LED ");
  this.appendValueInput("LED").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(" (1~64)");
  this.appendDummyInput().appendField(" R ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "RED");
  this.appendDummyInput().appendField(" G ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "GREEN");
  this.appendDummyInput().appendField(" B ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "BLUE");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_external_led = function(b, a) {
  var d = a.getNumberValue("LED"), c = a.getStringField("RED"), e = a.getStringField("GREEN"), f = a.getStringField("BLUE");
  Entry.hw.setDigitalPortValue("ELED_IDX", d);
  Entry.hw.setDigitalPortValue("ELED_R", c);
  Entry.hw.setDigitalPortValue("ELED_G", e);
  Entry.hw.setDigitalPortValue("ELED_B", f);
  return a.callReturn();
};
Blockly.Blocks.cobl_7_segment = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("7 Segment");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(0~9999)");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_7_segment = function(b, a) {
  var d = a.getNumberValue("VALUE");
  Entry.hw.setDigitalPortValue("7SEG", d);
  return a.callReturn();
};
Entry.Codestar = {name:"codestar", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0;20 > b;b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/codestar.png", width:333, height:409, listPorts:{13:{name:"\uc9c4\ub3d9\ubaa8\ud130", type:"output", pos:{x:0, y:0}}, 6:{name:"\uc9c4\ub3d9\uc13c\uc11c", type:"input", pos:{x:0, y:0}}}, ports:{7:{name:"\ube68\uac04\uc0c9", type:"output", pos:{x:238, y:108}}, 8:{name:"\ud30c\ub780\uc0c9", type:"output", pos:{x:265, y:126}}, 9:{name:"3\uc0c9 \ube68\uac04\uc0c9", type:"output", pos:{x:292, y:34}}, 10:{name:"3\uc0c9 \ub179\uc0c9", type:"output", pos:{x:292, y:34}}, 11:{name:"3\uc0c9 \ud30c\ub780\uc0c9", 
type:"output", pos:{x:292, y:34}}, 12:{name:"\ubc84\ud2bc", type:"input", pos:{x:248, y:142}}, a0:{name:"\uc67c\ucabd \ubcbd\uac10\uc9c0", type:"input", pos:{x:24, y:231}}, a2:{name:"\ub9c8\uc774\ud06c", type:"input", pos:{x:225, y:67}}, a3:{name:"\ubd80\uc800", type:"output", pos:{x:283, y:105}}, a4:{name:"\uc67c\ucabd \ub77c\uc778\uac10\uc9c0", type:"input", pos:{x:37, y:353}}, a5:{name:"\uc624\ub978\ucabd \ub77c\uc778\uac10\uc9c0", type:"input", pos:{x:50, y:368}}, a6:{name:"\uc870\ub3c4\uc13c\uc11c", 
type:"input", pos:{x:273, y:22}}, a7:{name:"\uc624\ub978\ucabd \ubcbd\uac10\uc9c0", type:"input", pos:{x:103, y:381}}, temperature:{name:"\uc628\ub3c4\uc13c\uc11c", type:"input", pos:{x:311, y:238}}, sonar:{name:"\ucd08\uc74c\ud30c", type:"input", pos:{x:7, y:277}}, leftwheel:{name:"\uc67c\ucabd \ubc14\ud034", type:"output", pos:{x:177, y:370}}, rightwheel:{name:"\uc624\ub978\ucabd \ubc14\ud034", type:"output", pos:{x:83, y:218}}}, mode:"both"}};
Entry.EV3 = {PORT_MAP:{A:0, B:0, C:0, D:0, 1:void 0, 2:void 0, 3:void 0, 4:void 0}, motorMovementTypes:{Degrees:0, Power:1}, deviceTypes:{NxtTouch:1, NxtLight:2, NxtSound:3, NxtColor:4, NxtUltrasonic:5, NxtTemperature:6, LMotor:7, MMotor:8, Touch:16, Color:29, Ultrasonic:30, Gyroscope:32, Infrared:33, Initializing:125, Empty:126, WrongPort:127, Unknown:255}, colorSensorValue:" 000000 0000FF 00FF00 FFFF00 FF0000 FFFFFF A52A2A".split(" "), timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, setZero:function() {
  var b = this.PORT_MAP;
  Object.keys(b).forEach(function(a) {
    /[A-D]/i.test(a) ? Entry.hw.sendQueue[a] = {type:Entry.EV3.motorMovementTypes.Power, power:0} : Entry.hw.sendQueue[a] = b[a];
  });
  Entry.hw.update();
}, name:"EV3"};
Blockly.Blocks.ev3_get_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.ev3_get_sensor_value = function(b, a) {
  a.getStringField("PORT", a);
  var d = Entry.hw.getDigitalPortValue(a.getNumberField("PORT", a)), c;
  $.isPlainObject(d) && (c = d.siValue || 0);
  return c;
};
Blockly.Blocks.ev3_touch_sensor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 \ud130\uce58\uc13c\uc11c\uac00 \uc791\ub3d9\ub418\uc5c8\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.ev3_touch_sensor = function(b, a) {
  a.getStringField("PORT", a);
  var d = Entry.hw.getDigitalPortValue(a.getNumberField("PORT", a)), c = !1;
  d.type == Entry.EV3.deviceTypes.Touch && 1 <= Number(d.siValue) && (c = !0);
  return c;
};
Blockly.Blocks.ev3_color_sensor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 ").appendField(new Blockly.FieldDropdown([["RGB", "RGB"], ["R", "R"], ["G", "G"], ["B", "B"]]), "RGB").appendField("\uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.ev3_color_sensor = function(b, a) {
  a.getStringField("PORT", a);
  var d = a.getStringField("RGB", a), c = Entry.hw.getDigitalPortValue(a.getNumberField("PORT", a)), e = "";
  if (c.type == Entry.EV3.deviceTypes.Color) {
    if (0 == c.siValue) {
      e = "";
    } else {
      switch(d) {
        case "RGB":
          e = Entry.EV3.colorSensorValue[c.siValue];
          break;
        case "R":
          e = Entry.EV3.colorSensorValue[c.siValue].substring(0, 2);
          break;
        case "G":
          e = Entry.EV3.colorSensorValue[c.siValue].substring(2, 4);
          break;
        case "B":
          e = Entry.EV3.colorSensorValue[c.siValue].substring(4, 6);
      }
    }
  } else {
    e = "\uceec\ub7ec \uc13c\uc11c \uc544\ub2d8";
  }
  return e;
};
Blockly.Blocks.ev3_motor_power = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\uc73c\ub85c \ucd9c\ub825");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_power = function(b, a) {
  var d = a.getStringField("PORT", a), c = a.getValue("VALUE", a);
  Entry.hw.sendQueue[d] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:c};
  return a.callReturn();
};
Blockly.Blocks.ev3_motor_power_on_time = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744");
  this.appendValueInput("TIME").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd08 \ub3d9\uc548");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\uc73c\ub85c \ucd9c\ub825");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_power_on_time = function(b, a) {
  var d = a.getStringField("PORT", a);
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    Entry.hw.sendQueue[d] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:0};
    return a.callReturn();
  }
  var c = a.getValue("TIME", a), e = a.getValue("VALUE", a);
  a.isStart = !0;
  a.timeFlag = 1;
  Entry.hw.sendQueue[d] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:e};
  var f = setTimeout(function() {
    a.timeFlag = 0;
    Entry.EV3.removeTimeout(f);
  }, 1E3 * c);
  Entry.EV3.timeouts.push(f);
  return a;
};
Blockly.Blocks.ev3_motor_degrees = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744").appendField(new Blockly.FieldDropdown([["\uc2dc\uacc4\ubc29\ud5a5", "CW"], ["\ubc18\uc2dc\uacc4\ubc29\ud5a5", "CCW"]]), "DIRECTION").appendField("\uc73c\ub85c ");
  this.appendValueInput("DEGREE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub3c4 \ub9cc\ud07c \ud68c\uc804");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_degrees = function(b, a) {
  var d = a.getStringField("PORT", a), c = a.getValue("DEGREE", a);
  0 >= c ? c = 0 : 720 <= c && (c = 720);
  var e = a.getStringField("DIRECTION", a);
  Entry.hw.sendQueue[d] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Degrees, degree:c, power:"CW" == e ? 50 : -50};
  return a.callReturn();
};
Entry.Hamster = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, outputA:0, outputB:0, leftLed:0, rightLed:0, note:0, lineTracerMode:0, lineTracerModeId:0, lineTracerSpeed:5, ioModeA:0, ioModeB:0}, setZero:function() {
  var b = Entry.Hamster.PORT_MAP, a = Entry.hw.sendQueue, d;
  for (d in b) {
    a[d] = b[d];
  }
  Entry.hw.update();
  b = Entry.Hamster;
  b.lineTracerModeId = 0;
  b.lineTracerStateId = -1;
  b.tempo = 60;
  b.removeAllTimeouts();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(b, a) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  b.lineTracerMode = a;
  b.lineTracerModeId = this.lineTracerModeId;
}, name:"hamster", monitorTemplate:{imgPath:"hw/hamster.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.HAMSTER_sensor_temperature, type:"input", pos:{x:0, y:0}}, inputA:{name:Lang.Blocks.HAMSTER_sensor_input_a, type:"input", pos:{x:0, y:0}}, inputB:{name:Lang.Blocks.HAMSTER_sensor_input_b, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.HAMSTER_sensor_acceleration_x, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.HAMSTER_sensor_acceleration_y, 
type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.HAMSTER_sensor_acceleration_z, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}, outputA:{name:Lang.Hw.output + "A", type:"output", pos:{x:0, y:0}}, outputB:{name:Lang.Hw.output + "B", type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.HAMSTER_sensor_left_proximity, type:"input", pos:{x:122, y:156}}, rightProximity:{name:Lang.Blocks.HAMSTER_sensor_right_proximity, 
type:"input", pos:{x:10, y:108}}, leftFloor:{name:Lang.Blocks.HAMSTER_sensor_left_floor, type:"input", pos:{x:100, y:234}}, rightFloor:{name:Lang.Blocks.HAMSTER_sensor_right_floor, type:"input", pos:{x:13, y:180}}, light:{name:Lang.Blocks.HAMSTER_sensor_light, type:"input", pos:{x:56, y:189}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:209, y:115}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:98, y:30}}, leftLed:{name:Lang.Hw.left + " " + Lang.Hw.led_en, type:"output", 
pos:{x:87, y:210}}, rightLed:{name:Lang.Hw.right + " " + Lang.Hw.led_en, type:"output", pos:{x:24, y:168}}}, mode:"both"}};
Blockly.Blocks.hamster_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.hamster_hand_found = function(b, a) {
  var d = Entry.hw.portData;
  return 50 < d.leftProximity || 50 < d.rightProximity;
};
Blockly.Blocks.hamster_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_sensor_left_proximity, "leftProximity"], [Lang.Blocks.HAMSTER_sensor_right_proximity, "rightProximity"], [Lang.Blocks.HAMSTER_sensor_left_floor, "leftFloor"], [Lang.Blocks.HAMSTER_sensor_right_floor, "rightFloor"], [Lang.Blocks.HAMSTER_sensor_acceleration_x, "accelerationX"], [Lang.Blocks.HAMSTER_sensor_acceleration_y, "accelerationY"], [Lang.Blocks.HAMSTER_sensor_acceleration_z, "accelerationZ"], 
  [Lang.Blocks.HAMSTER_sensor_light, "light"], [Lang.Blocks.HAMSTER_sensor_temperature, "temperature"], [Lang.Blocks.HAMSTER_sensor_signal_strength, "signalStrength"], [Lang.Blocks.HAMSTER_sensor_input_a, "inputA"], [Lang.Blocks.HAMSTER_sensor_input_b, "inputB"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.hamster_value = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.hamster_move_forward_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_once).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_once = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      switch(a.boardState) {
        case 1:
          2 > a.count ? (50 > c.leftFloor && 50 > c.rightFloor ? a.count++ : a.count = 0, c = c.leftFloor - c.rightFloor, d.leftWheel = 45 + .25 * c, d.rightWheel = 45 - .25 * c) : (a.count = 0, a.boardState = 2);
          break;
        case 2:
          c = c.leftFloor - c.rightFloor;
          d.leftWheel = 45 + .25 * c;
          d.rightWheel = 45 - .25 * c;
          a.boardState = 3;
          var e = setTimeout(function() {
            a.boardState = 4;
            Entry.Hamster.removeTimeout(e);
          }, 250);
          Entry.Hamster.timeouts.push(e);
          break;
        case 3:
          c = c.leftFloor - c.rightFloor;
          d.leftWheel = 45 + .25 * c;
          d.rightWheel = 45 - .25 * c;
          break;
        case 4:
          d.leftWheel = 0, d.rightWheel = 0, a.boardState = 0, a.isMoving = !1;
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  d.leftWheel = 45;
  d.rightWheel = 45;
  Entry.Hamster.setLineTracerMode(d, 0);
  return a;
};
Blockly.Blocks.hamster_turn_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_once_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_turn_once_left, "LEFT"], [Lang.Blocks.HAMSTER_turn_once_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_once_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_once = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      if (a.isLeft) {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < c.leftFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > c.leftFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > c.leftFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < c.leftFloor && (a.boardState = 5);
            break;
          case 5:
            c = c.leftFloor - c.rightFloor, -15 < c ? (d.leftWheel = 0, d.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (d.leftWheel = .5 * c, d.rightWheel = .5 * -c);
        }
      } else {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < c.rightFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > c.rightFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > c.rightFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < c.rightFloor && (a.boardState = 5);
            break;
          case 5:
            c = c.rightFloor - c.leftFloor, -15 < c ? (d.leftWheel = 0, d.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (d.leftWheel = .5 * -c, d.rightWheel = .5 * c);
        }
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    delete a.isLeft;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (a.isLeft = !0, d.leftWheel = -45, d.rightWheel = 45) : (a.isLeft = !1, d.leftWheel = 45, d.rightWheel = -45);
  Entry.Hamster.setLineTracerMode(d, 0);
  return a;
};
Blockly.Blocks.hamster_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = 30;
  d.rightWheel = 30;
  Entry.Hamster.setLineTracerMode(d, 0);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, d);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_backward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = -30;
  d.rightWheel = -30;
  Entry.Hamster.setLineTracerMode(d, 0);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, d);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_turn_left, "LEFT"], [Lang.Blocks.HAMSTER_turn_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (d.leftWheel = -30, d.rightWheel = 30) : (d.leftWheel = 30, d.rightWheel = -30);
  Entry.Hamster.setLineTracerMode(d, 0);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, d);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_both_wheels_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + c : c;
  d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e;
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_both_wheels_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = a.getNumberValue("LEFT");
  d.rightWheel = a.getNumberValue("RIGHT");
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_wheel, "LEFT"], [Lang.Blocks.HAMSTER_right_wheel, "RIGHT"], [Lang.Blocks.HAMSTER_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_wheel_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e : ("RIGHT" != c && (d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e), d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e);
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_wheel, "LEFT"], [Lang.Blocks.HAMSTER_right_wheel, "RIGHT"], [Lang.Blocks.HAMSTER_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_wheel_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = e : ("RIGHT" != c && (d.leftWheel = e), d.rightWheel = e);
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_using = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_using_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.Blocks.HAMSTER_color_white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_using_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_floor_sensor, "LEFT"], [Lang.Blocks.HAMSTER_right_floor_sensor, "RIGHT"], [Lang.Blocks.HAMSTER_both_floor_sensors, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_using_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_using = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("COLOR"), e = a.getField("DIRECTION"), f = 1;
  "RIGHT" == e ? f = 2 : "BOTH" == e && (f = 3);
  "WHITE" == c && (f += 7);
  d.leftWheel = 0;
  d.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(d, f);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_until = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_until_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.Blocks.HAMSTER_color_white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_until_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_intersection, "LEFT"], [Lang.Blocks.HAMSTER_right_intersection, "RIGHT"], [Lang.Blocks.HAMSTER_front_intersection, "FRONT"], [Lang.Blocks.HAMSTER_rear_intersection, "REAR"]]), 
  "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_until_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_until = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData, e = a.getField("COLOR"), f = a.getField("DIRECTION"), g = 4;
  "RIGHT" == f ? g = 5 : "FRONT" == f ? g = 6 : "REAR" == f && (g = 7);
  "WHITE" == e && (g += 7);
  if (a.isStart) {
    if (e = Entry.Hamster, c.lineTracerStateId != e.lineTracerStateId && (e.lineTracerStateId = c.lineTracerStateId, 64 == c.lineTracerState)) {
      return delete a.isStart, Entry.engine.isContinue = !1, e.setLineTracerMode(d, 0), a.callReturn();
    }
  } else {
    a.isStart = !0, d.leftWheel = 0, d.rightWheel = 0, Entry.Hamster.setLineTracerMode(d, g);
  }
  return a;
};
Blockly.Blocks.hamster_set_following_speed_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_following_speed_to_1).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "SPEED").appendField(Lang.Blocks.HAMSTER_set_following_speed_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_following_speed_to = function(b, a) {
  Entry.hw.sendQueue.lineTracerSpeed = Number(a.getField("SPEED", a));
  return a.callReturn();
};
Blockly.Blocks.hamster_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_stop = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = 0;
  d.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_led, "LEFT"], [Lang.Blocks.HAMSTER_right_led, "RIGHT"], [Lang.Blocks.HAMSTER_both_leds, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.HAMSTER_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.HAMSTER_color_magenta, 
  "5"], [Lang.Blocks.HAMSTER_color_white, "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_led_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "LEFT" == c ? d.leftLed = e : ("RIGHT" != c && (d.leftLed = e), d.rightLed = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_led, "LEFT"], [Lang.Blocks.HAMSTER_right_led, "RIGHT"], [Lang.Blocks.HAMSTER_both_leds, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_led = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a);
  "LEFT" == c ? d.leftLed = 0 : ("RIGHT" != c && (d.leftLed = 0), d.rightLed = 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_beep = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 440;
  d.note = 0;
  var c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, 200);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_buzzer_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("VALUE");
  d.buzzer = void 0 != d.buzzer ? d.buzzer + c : c;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_buzzer_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = a.getNumberValue("VALUE");
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_buzzer = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = 0;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.HAMSTER_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_play_note_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return a.callReturn();
  }
  var c = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Hamster.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 0;
  d.note = c + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      d.note = 0;
      Entry.Hamster.removeTimeout(h);
    }, f - 100);
    Entry.Hamster.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(k);
  }, f);
  Entry.Hamster.timeouts.push(k);
  return a;
};
Blockly.Blocks.hamster_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_rest_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var c = a.getNumberValue("VALUE"), c = 6E4 * c / Entry.Hamster.tempo;
  d.buzzer = 0;
  d.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(e);
  }, c);
  Entry.Hamster.timeouts.push(e);
  return a;
};
Blockly.Blocks.hamster_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_tempo_by = function(b, a) {
  Entry.Hamster.tempo += a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_tempo_to = function(b, a) {
  Entry.Hamster.tempo = a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_port_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_port_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_port_to_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_analog_input, "0"], [Lang.Blocks.HAMSTER_digital_input, "1"], [Lang.Blocks.HAMSTER_servo_output, "8"], [Lang.Blocks.HAMSTER_pwm_output, "9"], [Lang.Blocks.HAMSTER_digital_output, 
  "10"]]), "MODE").appendField(Lang.Blocks.HAMSTER_set_port_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_port_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("PORT", a), e = Number(a.getField("MODE", a));
  "A" == c ? d.ioModeA = e : ("B" != c && (d.ioModeA = e), d.ioModeB = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_output_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_change_output_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_output_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == c ? d.outputA = void 0 != d.outputA ? d.outputA + e : e : ("B" != c && (d.outputA = void 0 != d.outputA ? d.outputA + e : e), d.outputB = void 0 != d.outputB ? d.outputB + e : e);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_output_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_output_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_output_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == c ? d.outputA = e : ("B" != c && (d.outputA = e), d.outputB = e);
  return a.callReturn();
};
Entry.Neobot = {name:"neobot", LOCAL_MAP:["IN1", "IN2", "IN3", "IR", "BAT"], REMOTE_MAP:"OUT1 OUT2 OUT3 DCR DCL SND FND OPT".split(" "), setZero:function() {
  for (var b in Entry.Neobot.REMOTE_MAP) {
    Entry.hw.sendQueue[Entry.Neobot.REMOTE_MAP[b]] = 0;
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/neobot.png", width:700, height:700, listPorts:{IR:{name:"\ub9ac\ubaa8\ucee8", type:"input", pos:{x:0, y:0}}, BAT:{name:"\ubca0\ud130\ub9ac", type:"input", pos:{x:0, y:0}}, SND:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, FND:{name:"FND", type:"output", pos:{x:0, y:0}}}, ports:{IN1:{name:"IN1", type:"input", pos:{x:270, y:200}}, IN2:{name:"IN2", type:"input", pos:{x:325, y:200}}, IN3:{name:"IN3", type:"input", pos:{x:325, y:500}}, DCL:{name:"L-Motor", type:"output", 
pos:{x:270, y:500}}, DCR:{name:"R-Motor", type:"output", pos:{x:435, y:500}}, OUT1:{name:"OUT1", type:"output", pos:{x:380, y:200}}, OUT2:{name:"OUT2", type:"output", pos:{x:435, y:200}}, OUT3:{name:"OUT3", type:"output", pos:{x:380, y:500}}}, mode:"both"}};
Blockly.Blocks.neobot_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1\ubc88 \ud3ec\ud2b8", "IN1"], ["2\ubc88 \ud3ec\ud2b8", "IN2"], ["3\ubc88 \ud3ec\ud2b8", "IN3"], ["\ub9ac\ubaa8\ucee8", "IR"], ["\ubc30\ud130\ub9ac", "BAT"]]), "PORT").appendField(" \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.neobot_sensor_value = function(b, a) {
  var d = a.getStringField("PORT");
  return Entry.hw.portData[d];
};
Blockly.Blocks.neobot_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_left_motor = function(b, a) {
  var d = a.getNumberField("SPEED"), c = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCL = d + c;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_left_motor = function(b, a) {
  Entry.hw.sendQueue.DCL = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_right_motor = function(b, a) {
  var d = a.getNumberField("SPEED"), c = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCR = d + c;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_right_motor = function(b, a) {
  Entry.hw.sendQueue.DCR = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_all_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc591\ucabd \ubaa8\ud130\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField(" \uc758 \uc18d\ub3c4\ub85c ").appendField(new Blockly.FieldDropdown([["\uc804\uc9c4", "1"], ["\ud6c4\uc9c4", "2"], ["\uc81c\uc790\ub9ac \uc88c\ud68c\uc804", "3"], ["\uc81c\uc790\ub9ac \uc6b0\ud68c\uc804", "4"], 
  ["\uc88c\ud68c\uc804", "5"], ["\uc6b0\ud68c\uc804", "6"]]), "DIRECTION").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_all_motor = function(b, a) {
  a.getNumberField("TYPE");
  var d = a.getNumberField("SPEED");
  switch(a.getNumberField("DIRECTION")) {
    case 1:
      Entry.hw.sendQueue.DCL = 16 + d;
      Entry.hw.sendQueue.DCR = 16 + d;
      break;
    case 2:
      Entry.hw.sendQueue.DCL = 32 + d;
      Entry.hw.sendQueue.DCR = 32 + d;
      break;
    case 3:
      Entry.hw.sendQueue.DCL = 32 + d;
      Entry.hw.sendQueue.DCR = 16 + d;
      break;
    case 4:
      Entry.hw.sendQueue.DCL = 16 + d;
      Entry.hw.sendQueue.DCR = 32 + d;
      break;
    case 5:
      Entry.hw.sendQueue.DCL = 0;
      Entry.hw.sendQueue.DCR = 16 + d;
      break;
    case 6:
      Entry.hw.sendQueue.DCL = 16 + d, Entry.hw.sendQueue.DCR = 0;
  }
  return a.callReturn();
};
Blockly.Blocks.neobot_set_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ud3ec\ud2b8\uc758 \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "10"], ["20\ub3c4", "20"], ["30\ub3c4", "30"], ["40\ub3c4", "40"], ["50\ub3c4", "50"], ["60\ub3c4", "60"], ["70\ub3c4", "70"], ["80\ub3c4", "80"], ["90\ub3c4", "90"], ["100\ub3c4", "100"], ["110\ub3c4", "110"], ["120\ub3c4", "120"], ["130\ub3c4", 
  "130"], ["140\ub3c4", "140"], ["150\ub3c4", "150"], ["160\ub3c4", "160"], ["170\ub3c4", "170"], ["180\ub3c4", "180"]]), "DEGREE").appendField(" \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_servo = function(b, a) {
  var d = a.getNumberField("PORT"), c = a.getNumberField("DEGREE");
  Entry.hw.sendQueue["OUT" + d] = c;
  3 === d && (d = 4);
  Entry.hw.sendQueue.OPT |= d;
  return a.callReturn();
};
Blockly.Blocks.neobot_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ubc88 \ud3ec\ud2b8\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_output = function(b, a) {
  var d = a.getStringField("PORT", a), c = a.getNumberValue("VALUE", a), e = d;
  0 > c ? c = 0 : 255 < c && (c = 255);
  3 === e && (e = 4);
  Entry.hw.sendQueue["OUT" + d] = c;
  Entry.hw.sendQueue.OPT &= ~e;
  return a.callReturn();
};
Blockly.Blocks.neobot_set_fnd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("FND\uc5d0");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_fnd = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  255 < d ? d = 255 : 0 > d && (d = 0);
  Entry.hw.sendQueue.FND = d;
  return a.callReturn();
};
Blockly.Blocks.neobot_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uba5c\ub85c\ub514").appendField(new Blockly.FieldDropdown([["\ubb34\uc74c", "0"], [Lang.General.note_c, "1"], [Lang.General.note_c + "#", "2"], [Lang.General.note_d, "3"], [Lang.General.note_d + "#", "4"], [Lang.General.note_e, "5"], [Lang.General.note_f, "6"], [Lang.General.note_f + "#", "7"], [Lang.General.note_g, "8"], [Lang.General.note_g + "#", "9"], [Lang.General.note_a, "10"], [Lang.General.note_a + "#", "11"], [Lang.General.note_b, "12"]]), "NOTE").appendField("\uc744(\ub97c)").appendField(new Blockly.FieldDropdown([["1", 
  "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"]]), "OCTAVE").appendField("\uc625\ud0c0\ube0c\ub85c").appendField(new Blockly.FieldDropdown([["2\ubd84\uc74c\ud45c", "2"], ["4\ubd84\uc74c\ud45c", "4"], ["8\ubd84\uc74c\ud45c", "8"], ["16\ubd84\uc74c\ud45c", "16"]]), "DURATION");
  this.appendDummyInput().appendField("\uae38\uc774\ub9cc\ud07c \uc18c\ub9ac\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_play_note_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.hw.sendQueue.SND = 0;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  var c = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberField("DURATION", a), c = c + 12 * e;
  a.isStart = !0;
  a.timeFlag = 1;
  65 < c && (c = 65);
  d.SND = c;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1 / f * 2E3);
  return a;
};
Entry.Roborobo_Roduino = {name:"roborobo_roduino", INSTRUCTION:{DIGITAL_READ:1, DIGITAL_SET_MODE:2, DIGITAL_WRITE:3, ANALOG_WRITE:4, ANALOG_READ:5, MOTOR:6, COLOR:7}, setZero:function() {
  for (var b = 0;5 > b;b++) {
    Entry.hw.sendQueue[b] = 0;
  }
  this.ColorPin = [0, 0, 0];
  Entry.hw.update();
}, setSendData:function(b) {
  Entry.hw.sendQueue = b;
  Entry.hw.update();
  this.wait(32);
}, wait:function(b) {
  for (var a = (new Date).getTime(), d = a;d < a + b;) {
    d = (new Date).getTime();
  }
}, ColorPin:[0, 0, 0]};
Entry.Roborobo_SchoolKit = {name:"roborobo_schoolkit", INSTRUCTION:{DIGITAL_READ:1, DIGITAL_WRITE:2, MOTOR:3, COLOR:4, SERVO:5}, setZero:function() {
  for (var b = 0;5 > b;b++) {
    Entry.hw.sendQueue[b] = 0;
  }
  this.ColorPin = [0, 0, 0];
  Entry.hw.update();
}, setSendData:function(b) {
  Entry.hw.sendQueue = b;
  Entry.hw.update();
  this.wait(32);
}, wait:function(b) {
  for (var a = (new Date).getTime(), d = a;d < a + b;) {
    d = (new Date).getTime();
  }
}, ColorPin:[0, 0, 0]};
Blockly.Blocks.roduino_on_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_on);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_on_block = function(b, a) {
  return "1";
};
Blockly.Blocks.roduino_off_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_off);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_off_block = function(b, a) {
  return "0";
};
Blockly.Blocks.roduino_get_analog_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_get_analog_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.roduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_get_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.roduino_get_analog_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_analog_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_analog_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_analog_value = function(b, a) {
  var d = parseInt(a.getValue("VALUE", a));
  Entry.Roduino.setSendData([Entry.Roduino.INSTRUCTION.ANALOG_READ, d]);
  return Entry.hw.getAnalogPortValue(d);
};
Blockly.Blocks.roduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_digital_value = function(b, a) {
  var d = a.getNumberValue("VALUE");
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.DIGITAL_READ, d]);
  return Entry.hw.portData[d - 2];
};
Blockly.Blocks.roduino_get_color = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_color + " ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_color_red, "red"], [Lang.Blocks.roborobo_color_green, "green"], [Lang.Blocks.roborobo_color_blue, "blue"], [Lang.Blocks.roborobo_color_yellow, "yellow"]]), "VALUE").appendField(Lang.Blocks.roborobo_color_detected);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_color = function(b, a) {
  var d = 0, c = a.getField("VALUE", a), e = [Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[0] - 2], Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[1] - 2], Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[2] - 2]];
  switch(c) {
    case "red":
      1 == e[0] && 0 == e[1] && 0 == e[2] && (d = 1);
      break;
    case "green":
      0 == e[0] && 1 == e[1] && 0 == e[2] && (d = 1);
      break;
    case "blue":
      0 == e[0] && 0 == e[1] && 1 == e[2] && (d = 1);
      break;
    case "yellow":
      1 == e[0] && 1 == e[1] && 1 == e[2] && (d = 1);
  }
  return d;
};
Blockly.Blocks.roduino_set_digital = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_on, "on"], [Lang.Blocks.roborobo_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_set_digital = function(b, a) {
  var d = a.getNumberValue("VALUE"), c = a.getField("OPERATOR");
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.DIGITAL_WRITE, d, "on" == c ? 1 : 0]);
  return a.callReturn();
};
Blockly.Blocks.roduino_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor1, "motor1"], [Lang.Blocks.roborobo_motor2, "motor2"]]), "MODE");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor_CW, "cw"], [Lang.Blocks.roborobo_motor_CCW, "ccw"], [Lang.Blocks.roborobo_motor_stop, "stop"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_motor = function(b, a) {
  var d = pin2 = 0, c = value2 = 0, d = a.getField("MODE"), c = a.getField("OPERATOR");
  "motor1" == d ? (d = 9, pin2 = 10) : (d = 11, pin2 = 12);
  "cw" == c ? (c = 1, value2 = 0) : "ccw" == c ? (c = 0, value2 = 1) : value2 = c = 0;
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.MOTOR, d, c, pin2, value2]);
  return a.callReturn();
};
Blockly.Blocks.roduino_set_color_pin = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_color + "R : ");
  this.appendValueInput("RED").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(" G : ");
  this.appendValueInput("GREEN").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(" B : ");
  this.appendValueInput("BLUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_set_color_pin = function(b, a) {
  var d = a.getNumberValue("RED", a), c = a.getNumberValue("GREEN", a), e = a.getNumberValue("BLUE", a);
  Entry.Roborobo_Roduino.ColorPin = [d, c, e];
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.COLOR, d, c, e]);
  return a.callReturn();
};
Blockly.Blocks.schoolkit_on_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_on);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_on_block = function(b, a) {
  return "1";
};
Blockly.Blocks.schoolkit_off_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_off);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_off_block = function(b, a) {
  return "0";
};
Blockly.Blocks.schoolkit_get_out_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "2"], ["OUT2", "3"], ["OUT3", "4"], ["OUT4", "5"], ["OUT5", "6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_get_out_port_number = function(b, a) {
  return a.getNumberField("PORT");
};
Blockly.Blocks.schoolkit_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_on, "on"], [Lang.Blocks.roborobo_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_set_output = function(b, a) {
  var d = a.getNumberValue("VALUE"), c = a.getField("OPERATOR");
  Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.DIGITAL_WRITE, d, "on" == c ? 1 : 0]);
  return a.callReturn();
};
Blockly.Blocks.schoolkit_get_in_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["IN1", "7"], ["IN2", "8"], ["IN3", "9"], ["IN4", "10"], ["IN5", "11"], ["IN6", "12"], ["IN7", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_get_in_port_number = function(b, a) {
  return a.getNumberField("PORT");
};
Blockly.Blocks.schoolkit_get_input_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.schoolkit_get_input_value = function(b, a) {
  var d = a.getNumberValue("VALUE");
  Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.DIGITAL_READ, d]);
  return Entry.hw.portData[d - 7];
};
Blockly.Blocks.schoolkit_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor1, "motor1"], [Lang.Blocks.roborobo_motor2, "motor2"]]), "MODE");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor_CW, "cw"], [Lang.Blocks.roborobo_motor_CCW, "ccw"], [Lang.Blocks.roborobo_motor_stop, "stop"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_motor = function(b, a) {
  var d = 0, d = a.getField("MODE"), c = a.getField("OPERATOR"), e = a.getNumberValue("VALUE"), d = "motor1" == d ? 7 : 8;
  255 < e ? e = 255 : 0 > e && (e = 0);
  "cw" == c ? Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.MOTOR, 1, d, e]) : "ccw" == c ? Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.MOTOR, 2, d, e]) : "stop" == c && Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.MOTOR, 0, d, e]);
  return a.callReturn();
};
Blockly.Blocks.schoolkit_set_servo_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("PIN").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(" : ");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_degree);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_set_servo_value = function(b, a) {
  var d = a.getNumberValue("PIN"), c = a.getNumberValue("VALUE");
  0 > c ? c = 0 : 180 < c && (c = 180);
  Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.SERVO, d, c]);
  return a.callReturn();
};
Entry.Robotis_carCont = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED:[67, 1], CM_SPRING_RIGHT:[69, 1, 69, 2], CM_SPRING_LEFT:[70, 1, 69, 2], CM_SWITCH:[71, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_IR_LEFT:[91, 2, 91, 4], CM_IR_RIGHT:[93, 2, 91, 4], CM_CALIBRATION_LEFT:[95, 2], CM_CALIBRATION_RIGHT:[97, 2], AUX_MOTOR_SPEED_LEFT:[152, 2], AUX_MOTOR_SPEED_RIGHT:[154, 2]}, setZero:function() {
  Entry.hw.sendQueue.setZero = [1];
  this.update();
  this.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  this.update();
  this.setRobotisData([[Entry.Robotis_carCont.INSTRUCTION.WRITE, 152, 2, 0], [Entry.Robotis_carCont.INSTRUCTION.WRITE, 154, 2, 0]]);
  this.update();
}, name:"robotis_carCont", delay:40, postCallReturn:function(b, a, d) {
  if (0 >= d) {
    return this.setRobotisData(a), this.update(), b.callReturn();
  }
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return this.setRobotisData(null), b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    this.update();
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  this.setRobotisData(a);
  setTimeout(function() {
    b.timeFlag = 0;
  }, d);
  return b;
}, wait:function(b, a) {
  Entry.hw.socket.send(JSON.stringify(b));
  for (var d = (new Date).getTime(), c = d;c < d + a;) {
    c = (new Date).getTime();
  }
}, update:function() {
  Entry.hw.update();
  var b = Entry.hw.sendQueue.ROBOTIS_DATA;
  b && b.forEach(function(a) {
    a.send = !0;
  });
  this.setRobotisData(null);
}, filterSendData:function() {
  var b = Entry.hw.sendQueue.ROBOTIS_DATA;
  return b ? b.filter(function(a) {
    return !0 !== a.send;
  }) : null;
}, setRobotisData:function(b) {
  var a = this.filterSendData();
  Entry.hw.sendQueue.ROBOTIS_DATA = null == b ? a : a ? a.concat(b) : b;
}};
Entry.Robotis_openCM70 = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED_R:[79, 1], CM_LED_G:[80, 1], CM_LED_B:[81, 1], CM_BUZZER_INDEX:[84, 1], CM_BUZZER_TIME:[85, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_USER_BUTTON:[26, 1], CM_MOTION:[66, 1], AUX_SERVO_POSITION:[152, 2], AUX_IR:[168, 2], AUX_TOUCH:[202, 1], AUX_TEMPERATURE:[234, 1], AUX_ULTRASONIC:[242, 1], AUX_MAGNETIC:[250, 1], AUX_MOTION_DETECTION:[258, 1], AUX_COLOR:[266, 1], AUX_CUSTOM:[216, 2], AUX_BRIGHTNESS:[288, 
2], AUX_HYDRO_THEMO_HUMIDITY:[274, 1], AUX_HYDRO_THEMO_TEMPER:[282, 1], AUX_SERVO_MODE:[126, 1], AUX_SERVO_SPEED:[136, 2], AUX_MOTOR_SPEED:[136, 2], AUX_LED_MODULE:[210, 1]}, setZero:function() {
  Entry.hw.sendQueue.setZero = [1];
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData([[Entry.Robotis_openCM70.INSTRUCTION.WRITE, 136, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 138, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 140, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 142, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 144, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 146, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 79, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 80, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 
  81, 1, 0]]);
  Entry.Robotis_carCont.update();
}, name:"robotis_openCM70", delay:15};
Blockly.Blocks.robotis_openCM70_cm_custom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["BYTE", "BYTE"], ["WORD", "WORD"], ["DWORD", "DWORD"]]), "SIZE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_openCM70_cm_custom_value = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.READ, c = 0, e = 0, f = 0, c = a.getStringField("SIZE");
  "BYTE" == c ? e = 1 : "WORD" == c ? e = 2 : "DWORD" == c && (e = 4);
  f = c = a.getNumberValue("VALUE");
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, e]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"]);
  b.push([Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"]);
  b.push([Lang.Blocks.robotis_cm_user_button, "CM_USER_BUTTON"]);
  return b;
}};
Entry.block.robotis_openCM70_sensor_value = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.READ, c = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_USER_BUTTON" == h && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1]);
  f += 0 * g;
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_aux_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.portList()), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, portList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_common_port_3, "PORT_3"]);
  b.push([Lang.Blocks.robotis_common_port_4, "PORT_4"]);
  b.push([Lang.Blocks.robotis_common_port_5, "PORT_5"]);
  b.push([Lang.Blocks.robotis_common_port_6, "PORT_6"]);
  return b;
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_aux_servo_position, "AUX_SERVO_POSITION"]);
  b.push([Lang.Blocks.robotis_aux_ir, "AUX_IR"]);
  b.push([Lang.Blocks.robotis_aux_touch, "AUX_TOUCH"]);
  b.push([Lang.Blocks.robotis_aux_brightness, "AUX_BRIGHTNESS"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_humidity, "AUX_HYDRO_THEMO_HUMIDITY"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_temper, "AUX_HYDRO_THEMO_TEMPER"]);
  b.push([Lang.Blocks.robotis_aux_temperature, "AUX_TEMPERATURE"]);
  b.push([Lang.Blocks.robotis_aux_ultrasonic, "AUX_ULTRASONIC"]);
  b.push([Lang.Blocks.robotis_aux_magnetic, "AUX_MAGNETIC"]);
  b.push([Lang.Blocks.robotis_aux_motion_detection, "AUX_MOTION_DETECTION"]);
  b.push([Lang.Blocks.robotis_aux_color, "AUX_COLOR"]);
  b.push([Lang.Blocks.robotis_aux_custom, "AUX_CUSTOM"]);
  return b;
}};
Entry.block.robotis_openCM70_aux_sensor_value = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.READ, c = 0, e = 0, f = 0, g = 0, h = a.getStringField("PORT"), k = a.getStringField("SENSOR"), l = 0;
  "PORT_3" == h ? l = 2 : "PORT_4" == h ? l = 3 : "PORT_5" == h ? l = 4 : "PORT_6" == h && (l = 5);
  "AUX_SERVO_POSITION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1]) : "AUX_IR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1]) : 
  "AUX_TOUCH" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1]) : "AUX_TEMPERATURE" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1]) : 
  "AUX_BRIGHTNESS" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1]) : "AUX_HYDRO_THEMO_HUMIDITY" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1]) : "AUX_HYDRO_THEMO_TEMPER" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1]) : "AUX_ULTRASONIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1]) : "AUX_MAGNETIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1]) : "AUX_MOTION_DETECTION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1]) : "AUX_COLOR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1]) : "AUX_CUSTOM" == k && (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1]);
  f += l * g;
  0 != l && (e = 6 * g);
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_index = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_index);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.note_a + "(0)", "0"], [Lang.General.note_a + "#(1)", "1"], [Lang.General.note_b + "(2)", "2"], [Lang.General.note_c + "(3)", "3"], [Lang.General.note_c + "#(4)", "4"], [Lang.General.note_d + "(5)", "5"], [Lang.General.note_d + "#(6)", "6"], [Lang.General.note_e + "(7)", "7"], [Lang.General.note_f + "(8)", "8"], [Lang.General.note_f + "#(9)", "9"], [Lang.General.note_g + "(10)", "10"], [Lang.General.note_g + "#(11)", "11"], 
  [Lang.General.note_a + "(12)", "12"], [Lang.General.note_a + "#(13)", "13"], [Lang.General.note_b + "(14)", "14"], [Lang.General.note_c + "(15)", "15"], [Lang.General.note_c + "#(16)", "16"], [Lang.General.note_d + "(17)", "17"], [Lang.General.note_d + "#(18)", "18"], [Lang.General.note_e + "(19)", "19"], [Lang.General.note_f + "(20)", "20"], [Lang.General.note_f + "#(21)", "21"], [Lang.General.note_g + "(22)", "22"], [Lang.General.note_g + "#(23)", "23"], [Lang.General.note_a + "(24)", "24"], 
  [Lang.General.note_a + "#(25)", "25"], [Lang.General.note_b + "(26)", "26"], [Lang.General.note_c + "(27)", "27"], [Lang.General.note_c + "#(28)", "28"], [Lang.General.note_d + "(29)", "29"], [Lang.General.note_d + "#(30)", "30"], [Lang.General.note_e + "(31)", "31"], [Lang.General.note_f + "(32)", "32"], [Lang.General.note_f + "#(33)", "33"], [Lang.General.note_g + "(34)", "34"], [Lang.General.note_g + "#(35)", "35"], [Lang.General.note_a + "(36)", "36"], [Lang.General.note_a + "#(37)", "37"], 
  [Lang.General.note_b + "(38)", "38"], [Lang.General.note_c + "(39)", "39"], [Lang.General.note_c + "#(40)", "40"], [Lang.General.note_d + "(41)", "41"], [Lang.General.note_d + "#(42)", "42"], [Lang.General.note_e + "(43)", "43"], [Lang.General.note_f + "(44)", "44"], [Lang.General.note_f + "#(45)", "45"], [Lang.General.note_g + "(46)", "46"], [Lang.General.note_g + "#(47)", "47"], [Lang.General.note_a + "(48)", "48"], [Lang.General.note_a + "#(49)", "49"], [Lang.General.note_b + "(50)", "50"], 
  [Lang.General.note_c + "(51)", "51"]]), "CM_BUZZER_INDEX").appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("CM_BUZZER_TIME").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3).appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_index = function(b, a) {
  var d = a.getField("CM_BUZZER_INDEX", a), c = a.getNumberValue("CM_BUZZER_TIME", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, k = 0, l = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], h = parseInt(10 * c);
  50 < h && (h = 50);
  k = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0];
  l = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h], [e, k, l, d]], 1E3 * c);
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_melody);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"], ["22", "22"], ["23", "23"], ["24", "24"]]), "CM_BUZZER_MELODY");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_melody = function(b, a) {
  var d = a.getField("CM_BUZZER_MELODY", a), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e = 0, f = 0, g = 0, h = 0, e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[c, e, f, 255], [c, g, h, d]], 1E3);
};
Blockly.Blocks.robotis_openCM70_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_sound_detected_clear = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, c = 0, e = 0, c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, e, 0]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_red_color, "CM_LED_R"], [Lang.Blocks.robotis_common_green_color, "CM_LED_G"], [Lang.Blocks.robotis_common_blue_color, "CM_LED_B"]]), "CM_LED").appendField("LED").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_led = function(b, a) {
  var d = a.getField("CM_LED", a), c = a.getField("VALUE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0;
  "CM_LED_R" == d ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[1]) : "CM_LED_G" == d ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[1]) : "CM_LED_B" == d && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_motion = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_motion);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_motion).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_motion = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, c = 0, e = 0, f = 0, c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[1], f = a.getNumberValue("VALUE", a);
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, e, f]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_1, "1"], [Lang.Blocks.robotis_common_port_2, "2"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_motor_speed = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[1];
  "CW" == c ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (d - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_mode = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_mode_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_wheel_mode, "0"], [Lang.Blocks.robotis_common_joint_mode, "1"]]), "MODE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_mode = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("MODE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_speed = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[1];
  "CW" == c ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (d - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_position = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_position_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_position = function(b, a) {
  var d = a.getField("PORT", a), c = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1];
  1023 < c ? c = 1023 : 0 > c && (c = 0);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_led_module = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_led_module_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_off, "0"], [Lang.Blocks.robotis_cm_led_right + Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_cm_led_left + 
  Lang.Blocks.robotis_common_on, "2"], [Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_on, "3"]]), "LED_MODULE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_led_module = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("LED_MODULE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_custom_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_custom = function(b, a) {
  var d = a.getField("PORT", a), c = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("ADDRESS").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_case_01);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_custom = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, c = 0, e = 0, c = a.getNumberValue("ADDRESS"), e = a.getNumberValue("VALUE");
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, 65535 < e ? 4 : 255 < e ? 2 : 1, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_carCont_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_spring_left, "CM_SPRING_LEFT"], [Lang.Blocks.robotis_cm_spring_right, "CM_SPRING_RIGHT"], [Lang.Blocks.robotis_cm_switch, "CM_SWITCH"], [Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"], [Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"], [Lang.Blocks.robotis_cm_ir_left, "CM_IR_LEFT"], [Lang.Blocks.robotis_cm_ir_right, "CM_IR_RIGHT"], [Lang.Blocks.robotis_cm_calibration_left, 
  "CM_CALIBRATION_LEFT"], [Lang.Blocks.robotis_cm_calibration_right, "CM_CALIBRATION_RIGHT"]]), "SENSOR").appendField(" ").appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_carCont_sensor_value = function(b, a) {
  var d = Entry.Robotis_carCont.INSTRUCTION.READ, c = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SPRING_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[3]) : "CM_SPRING_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[3]) : 
  "CM_SWITCH" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1]) : "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : 
  "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_IR_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[3]) : 
  "CM_IR_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[3]) : "CM_CALIBRATION_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : 
  "CM_CALIBRATION_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]) : "CM_BUTTON_STATUS" == h && (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], 
  e = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1]);
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_carCont_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_led_4).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_LEFT").appendField(", ").appendField(Lang.Blocks.robotis_cm_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_RIGHT").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_led = function(b, a) {
  var d = a.getField("VALUE_LEFT", a), c = a.getField("VALUE_RIGHT", a), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, f = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[1];
  1 == d && 1 == c ? h = 9 : 1 == d && 0 == c && (h = 8);
  0 == d && 1 == c && (h = 1);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_sound_detected_clear = function(b, a) {
  var d = Entry.Robotis_carCont.INSTRUCTION.WRITE, c = 0, e = 0, c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, e, 0]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_aux_motor_speed = function(b, a) {
  var d = a.getField("DIRECTION", a), c = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_carCont.INSTRUCTION.WRITE, g = 0, h = 0;
  "LEFT" == d ? (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[1]) : (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[1]);
  "CW" == c ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g, h, e]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_calibration = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_calibration_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_calibration = function(b, a) {
  var d = a.getField("DIRECTION", a), c = a.getNumberValue("VALUE"), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0;
  "LEFT" == d ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, c]], Entry.Robotis_carCont.delay);
};
Entry.Xbot = {PORT_MAP:{rightWheel:0, leftWheel:0, head:90, armR:90, armL:90, analogD5:127, analogD6:127, D4:0, D7:0, D12:0, D13:0, ledR:0, ledG:0, ledB:0, lcdNum:0, lcdTxt:"                ", note:262, duration:0}, setZero:function() {
  var b = Entry.Xbot.PORT_MAP, a = Entry.hw.sendQueue, d;
  for (d in b) {
    a[d] = b[d];
  }
  Entry.hw.update();
  Entry.Xbot.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, name:"xbot_epor_edge"};
Blockly.Blocks.xbot_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_D2_digitalInput, "D2"], [Lang.Blocks.XBOT_D3_digitalInput, "D3"], [Lang.Blocks.XBOT_D11_digitalInput, "D11"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.xbot_digitalInput = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.xbot_analogValue = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_CDS, "light"], [Lang.Blocks.XBOT_MIC, "mic"], [Lang.Blocks.XBOT_analog0, "adc0"], [Lang.Blocks.XBOT_analog1, "adc1"], [Lang.Blocks.XBOT_analog2, "adc2"], [Lang.Blocks.XBOT_analog3, "adc3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.xbot_analogValue = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.xbot_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_digital).appendField(new Blockly.FieldDropdown([["LED", "D13"], ["D4", "D4"], ["D7", "D7"], ["D12 ", "D12"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_OutputValue).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_High, "HIGH"], [Lang.Blocks.XBOT_Low, "LOW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_digitalOutput = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getStringField("VALUE", a);
  d.D13 = "D13" == c && "HIGH" == e ? 1 : 0;
  d.D4 = "D4" == c && "HIGH" == e ? 1 : 0;
  d.D7 = "D7" == c && "HIGH" == e ? 1 : 0;
  d.D12 = "D12" == c && "HIGH" == e ? 1 : 0;
  return a.callReturn();
};
Blockly.Blocks.xbot_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_analog).appendField(new Blockly.FieldDropdown([["D5", "analogD5"], ["D6", "analogD6"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_Output_Value);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_analogOutput = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "analogD5" == c ? d.analogD5 = e : "analogD6" == c && (d.analogD6 = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_Servo).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_Head, "head"], [Lang.Blocks.XBOT_ArmR, "right"], [Lang.Blocks.XBOT_ArmL, "left"]]), "DEVICE").appendField(Lang.Blocks.XBOT_angle);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_servo = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "head" == c ? d.head = e : "right" == c ? d.armR = e : "left" == c && (d.armL = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_oneWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_rightWheel, "rightWheel"], [Lang.Blocks.XBOT_leftWheel, "leftWheel"], [Lang.Blocks.XBOT_bothWheel, "bothWheel"]]), "DEVICE").appendField(Lang.Blocks.XBOT_speed);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_oneWheel = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "rightWheel" == c ? d.rightWheel = e : "leftWheel" == c ? d.leftWheel = e : d.rightWheel = d.leftWheel = e;
  return a.callReturn();
};
Blockly.Blocks.xbot_twoWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_rightSpeed);
  this.appendValueInput("rightWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_leftSpeed);
  this.appendValueInput("leftWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_twoWheel = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.rightWheel = a.getNumberValue("rightWheel");
  d.leftWheel = a.getNumberValue("leftWheel");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_R);
  this.appendValueInput("ledR").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_G);
  this.appendValueInput("ledG").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_B);
  this.appendValueInput("ledB").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.ledR = a.getNumberValue("ledR");
  d.ledG = a.getNumberValue("ledG");
  d.ledB = a.getNumberValue("ledB");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_color).appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField(Lang.Blocks.XBOT_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb_picker = function(b, a) {
  var d = a.getStringField("VALUE"), c = Entry.hw.sendQueue;
  c.ledR = parseInt(.3 * parseInt(d.substr(1, 2), 16));
  c.ledG = parseInt(.3 * parseInt(d.substr(3, 2), 16));
  c.ledB = parseInt(.3 * parseInt(d.substr(5, 2), 16));
  return a.callReturn();
};
Blockly.Blocks.xbot_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_c, "C"], [Lang.Blocks.XBOT_d, "D"], [Lang.Blocks.XBOT_e, "E"], [Lang.Blocks.XBOT_f, "F"], [Lang.Blocks.XBOT_g, "G"], [Lang.Blocks.XBOT_a, "A"], [Lang.Blocks.XBOT_b, "B"]]), "NOTE").appendField(" ").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_melody_ms).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_buzzer = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("NOTE", a), e = a.getStringField("OCTAVE", a), f = a.getNumberValue("VALUE", a), c = c + e;
  d.note = "C2" == c ? 65 : "D2" == c ? 73 : "E2" == c ? 82 : "F2" == c ? 87 : "G2" == c ? 98 : "A2" == c ? 110 : "B2" == c ? 123 : "C3" == c ? 131 : "D3" == c ? 147 : "E3" == c ? 165 : "F3" == c ? 175 : "G3" == c ? 196 : "A3" == c ? 220 : "B3" == c ? 247 : "C4" == c ? 262 : "D4" == c ? 294 : "E4" == c ? 330 : "F4" == c ? 349 : "G4" == c ? 392 : "A4" == c ? 440 : "B4" == c ? 494 : "C5" == c ? 523 : "D5" == c ? 587 : "E5" == c ? 659 : "F5" == c ? 698 : "G5" == c ? 784 : "A5" == c ? 880 : "B5" == c ? 
  988 : "C6" == c ? 1047 : "D6" == c ? 1175 : "E6" == c ? 1319 : "F6" == c ? 1397 : "G6" == c ? 1568 : "A6" == c ? 1760 : "B6" == c ? 1976 : "C7" == c ? 2093 : "D7" == c ? 2349 : "E7" == c ? 2637 : "F7" == c ? 2794 : "G7" == c ? 3136 : "A7" == c ? 3520 : "B7" == c ? 3951 : 262;
  d.duration = 40 * f;
  return a.callReturn();
};
Blockly.Blocks.xbot_lcd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LCD").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "LINE").appendField(Lang.Blocks.XBOT_Line).appendField(", ").appendField(Lang.Blocks.XBOT_outputValue);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_lcd = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberField("LINE", a), e = a.getStringValue("VALUE", a);
  0 == c ? (d.lcdNum = 0, d.lcdTxt = e) : 1 == c && (d.lcdNum = 1, d.lcdTxt = e);
  return a.callReturn();
};
Entry.Collection = function(b) {
  this.length = 0;
  this._hashMap = {};
  this._observers = [];
  this.set(b);
};
(function(b, a) {
  b.set = function(b) {
    for (;this.length;) {
      a.pop.call(this);
    }
    var c = this._hashMap, e;
    for (e in c) {
      delete c[e];
    }
    if (void 0 !== b) {
      e = 0;
      for (var f = b.length;e < f;e++) {
        var g = b[e];
        c[g.id] = g;
        a.push.call(this, g);
      }
    }
  };
  b.push = function(b) {
    this._hashMap[b.id] = b;
    a.push.call(this, b);
  };
  b.unshift = function() {
    for (var b = Array.prototype.slice.call(arguments, 0), c = this._hashMap, e = b.length - 1;0 <= e;e--) {
      var f = b[e];
      a.unshift.call(this, f);
      c[f.id] = f;
    }
  };
  b.insert = function(b, c) {
    a.splice.call(this, c, 0, b);
    this._hashMap[b.id] = b;
  };
  b.has = function(a) {
    return !!this._hashMap[a];
  };
  b.get = function(a) {
    return this._hashMap[a];
  };
  b.at = function(a) {
    return this[a];
  };
  b.getAll = function() {
    for (var a = this.length, b = [], e = 0;e < a;e++) {
      b.push(this[e]);
    }
    return b;
  };
  b.indexOf = function(b) {
    return a.indexOf.call(this, b);
  };
  b.find = function(a) {
    for (var b = [], e, f = 0, g = this.length;f < g;f++) {
      e = !0;
      var h = this[f], k;
      for (k in a) {
        if (a[k] != h[k]) {
          e = !1;
          break;
        }
      }
      e && b.push(h);
    }
    return b;
  };
  b.pop = function() {
    var b = a.pop.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.shift = function() {
    var b = a.shift.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.slice = function(b, c) {
    var e = a.slice.call(this, b, c), f = this._hashMap, g;
    for (g in e) {
      delete f[e[g].id];
    }
    return e;
  };
  b.remove = function(a) {
    var b = this.indexOf(a);
    -1 < b && (delete this._hashMap[a.id], this.splice(b, 1));
  };
  b.splice = function(b, c) {
    var e = a.slice.call(arguments, 2), f = this._hashMap;
    c = void 0 === c ? this.length - b : c;
    for (var g = a.splice.call(this, b, c), h = 0, k = g.length;h < k;h++) {
      delete f[g[h].id];
    }
    h = 0;
    for (k = e.length;h < k;h++) {
      f = e[h], a.splice.call(this, b++, 0, f), this._hashMap[f.id] = f;
    }
    return g;
  };
  b.clear = function() {
    for (;this.length;) {
      a.pop.call(this);
    }
    this._hashMap = {};
  };
  b.map = function(a, b) {
    for (var e = [], f = 0, g = this.length;f < g;f++) {
      e.push(a(this[f], b));
    }
    return e;
  };
  b.moveFromTo = function(b, c) {
    var e = this.length - 1;
    0 > b || 0 > c || b > e || c > e || a.splice.call(this, c, 0, a.splice.call(this, b, 1)[0]);
  };
  b.sort = function() {
  };
  b.fromJSON = function() {
  };
  b.toJSON = function() {
    for (var a = [], b = 0, e = this.length;b < e;b++) {
      a.push(this[b].toJSON());
    }
    return a;
  };
  b.observe = function() {
  };
  b.unobserve = function() {
  };
  b.notify = function() {
  };
  b.destroy = function() {
  };
})(Entry.Collection.prototype, Array.prototype);
Entry.Event = function(b) {
  this._sender = b;
  this._listeners = [];
};
(function(b) {
  b.attach = function(a, b) {
    var c = this, e = {obj:a, fn:b, destroy:function() {
      c.detach(this);
    }};
    this._listeners.push(e);
    return e;
  };
  b.detach = function(a) {
    var b = this._listeners;
    a = b.indexOf(a);
    if (-1 < a) {
      return b.splice(a, 1);
    }
  };
  b.clear = function() {
    for (var a = this._listeners;a.length;) {
      a.pop();
    }
  };
  b.notify = function() {
    var a = arguments;
    this._listeners.slice().forEach(function(b) {
      b.fn.apply(b.obj, a);
    });
  };
})(Entry.Event.prototype);
Entry.Observer = function(b, a, d, c) {
  this.parent = b;
  this.object = a;
  this.funcName = d;
  this.attrs = c;
  b.push(this);
};
(function(b) {
  b.destroy = function() {
    var a = this.parent, b = a.indexOf(this);
    -1 < b && a.splice(b, 1);
    return this;
  };
})(Entry.Observer.prototype);
Entry.Container = function() {
  this.objects_ = [];
  this.cachedPicture = {};
  this.inputValue = {};
  this.currentObjects_ = this.copiedObject = null;
  this._extensionObjects = [];
};
Entry.Container.prototype.generateView = function(b, a) {
  var d = this;
  this._view = b;
  this._view.addClass("entryContainer");
  this._view.addClass("entryContainerWorkspace");
  this._view.setAttribute("id", "entryContainerWorkspaceId");
  var c = Entry.createElement("div");
  c.addClass("entryAddObjectWorkspace");
  c.innerHTML = Lang.Workspace.add_object;
  c.bindOnClick(function(a) {
    Entry.dispatchEvent("openSpriteManager");
  });
  var c = Entry.createElement("div"), e = "entryContainerListWorkspaceWrapper";
  Entry.isForLecture && (e += " lecture");
  c.addClass(e);
  Entry.Utils.disableContextmenu(c);
  $(c).bind("mousedown touchstart", function(a) {
    function b(a) {
      q && 5 < Math.sqrt(Math.pow(a.pageX - q.x, 2) + Math.pow(a.pageY - q.y, 2)) && e && (clearTimeout(e), e = null);
    }
    function c(a) {
      a.stopPropagation();
      l.unbind(".container");
      e && (clearTimeout(e), e = null);
    }
    var e = null, l = $(document), m = a.type, n = !1;
    if (Entry.Utils.isRightButton(a)) {
      d._rightClick(a), n = !0;
    } else {
      var q = {x:a.clientX, y:a.clientY};
      "touchstart" !== m || n || (a.stopPropagation(), a = Entry.Utils.convertMouseEvent(a), e = setTimeout(function() {
        e && (e = null, d._rightClick(a));
      }, 1E3), l.bind("mousemove.container touchmove.container", b), l.bind("mouseup.container touchend.container", c));
    }
  });
  this._view.appendChild(c);
  e = Entry.createElement("ul");
  c.appendChild(e);
  this._extensionListView = Entry.Dom(e, {class:"entryContainerExtensions"});
  e = Entry.createElement("ul");
  e.addClass("entryContainerListWorkspace");
  c.appendChild(e);
  this.listView_ = e;
  this.enableSort();
};
Entry.Container.prototype.enableSort = function() {
  $ && $(this.listView_).sortable({start:function(b, a) {
    a.item.data("start_pos", a.item.index());
  }, stop:function(b, a) {
    var d = a.item.data("start_pos"), c = a.item.index();
    Entry.container.moveElement(d, c);
  }, axis:"y", cancel:"input.selectedEditingObject"});
};
Entry.Container.prototype.disableSort = function() {
  $ && $(this.listView_).sortable("destroy");
};
Entry.Container.prototype.updateListView = function() {
  if (this.listView_) {
    for (var b = this.listView_;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    var a = this.getCurrentObjects(), d;
    for (d in a) {
      b.appendChild(a[d].view_);
    }
    Entry.stage.sortZorder();
  }
};
Entry.Container.prototype.setObjects = function(b) {
  for (var a in b) {
    var d = new Entry.EntryObject(b[a]);
    this.objects_.push(d);
    d.generateView();
    d.pictures.map(function(a) {
      Entry.playground.generatePictureElement(a);
    });
    d.sounds.map(function(a) {
      Entry.playground.generateSoundElement(a);
    });
  }
  this.updateObjectsOrder();
  this.updateListView();
  Entry.stage.sortZorder();
  Entry.variableContainer.updateViews();
  b = Entry.type;
  ("workspace" == b || "phone" == b) && (b = this.getCurrentObjects()[0]) && this.selectObject(b.id);
};
Entry.Container.prototype.getPictureElement = function(b, a) {
  var d = this.getObject(a).getPicture(b);
  if (d) {
    return d.view;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.setPicture = function(b) {
  var a = this.getObject(b.objectId), d;
  for (d in a.pictures) {
    if (b.id === a.pictures[d].id) {
      var c = {};
      c.dimension = b.dimension;
      c.id = b.id;
      c.filename = b.filename;
      c.fileurl = b.fileurl;
      c.name = b.name;
      c.view = a.pictures[d].view;
      a.pictures[d] = c;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.selectPicture = function(b, a) {
  var d = this.getObject(a), c = d.getPicture(b);
  if (c) {
    return d.selectedPicture = c, d.entity.setImage(c), d.updateThumbnailView(), d.id;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.addObject = function(b, a) {
  var d = new Entry.EntryObject(b);
  d.name = Entry.getOrderedName(d.name, this.objects_);
  Entry.stateManager && Entry.stateManager.addCommand("add object", this, this.removeObject, d);
  d.scene || (d.scene = Entry.scene.selectedScene);
  "number" == typeof a ? b.sprite.category && "background" == b.sprite.category.main ? (d.setLock(!0), this.objects_.push(d)) : this.objects_.splice(a, 0, d) : b.sprite.category && "background" == b.sprite.category.main ? this.objects_.push(d) : this.objects_.unshift(d);
  d.generateView();
  d.pictures.map(function(a) {
    Entry.playground.generatePictureElement(a);
  });
  d.sounds.map(function(a) {
    Entry.playground.generateSoundElement(a);
  });
  this.setCurrentObjects();
  this.updateObjectsOrder();
  this.updateListView();
  this.selectObject(d.id);
  Entry.variableContainer.updateViews();
  return new Entry.State(this, this.removeObject, d);
};
Entry.Container.prototype.addExtension = function(b) {
  this._extensionObjects.push(b);
  this._extensionListView.append(b.renderView());
};
Entry.Container.prototype.addCloneObject = function(b, a) {
  var d = b.toJSON(), c = Entry.generateHash();
  Entry.variableContainer.addCloneLocalVariables({objectId:d.id, newObjectId:c, json:d});
  d.id = c;
  d.scene = a || Entry.scene.selectedScene;
  this.addObject(d);
};
Entry.Container.prototype.removeObject = function(b) {
  var a = this.objects_.indexOf(b), d = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove object", this, this.addObject, d, a);
  d = new Entry.State(this.addObject, d, a);
  b.destroy();
  this.objects_.splice(a, 1);
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  a = this.getCurrentObjects();
  a.length ? this.selectObject(a[0].id) : (this.selectObject(), Entry.playground.flushPlayground());
  Entry.toast.success(Lang.Workspace.remove_object, b.name + " " + Lang.Workspace.remove_object_msg);
  Entry.variableContainer.removeLocalVariables(b.id);
  Entry.playground.reloadPlayground();
  return d;
};
Entry.Container.prototype.selectObject = function(b, a) {
  var d = this.getObject(b);
  a && d && Entry.scene.selectScene(d.scene);
  this.mapObjectOnScene(function(a) {
    a.view_ && a.view_.removeClass("selectedObject");
    a.isSelected_ = !1;
  });
  d && (d.view_ && d.view_.addClass("selectedObject"), d.isSelected_ = !0);
  Entry.playground && Entry.playground.injectObject(d);
  "minimize" != Entry.type && Entry.engine.isState("stop") && Entry.stage.selectObject(d);
};
Entry.Container.prototype.getAllObjects = function() {
  return this.objects_;
};
Entry.Container.prototype.getObject = function(b) {
  !b && Entry.playground && Entry.playground.object && (b = Entry.playground.object.id);
  for (var a = this.objects_.length, d = 0;d < a;d++) {
    var c = this.objects_[d];
    if (c.id == b) {
      return c;
    }
  }
};
Entry.Container.prototype.getEntity = function(b) {
  if (b = this.getObject(b)) {
    return b.entity;
  }
  Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.object_not_found, !0);
};
Entry.Container.prototype.getVariable = function(b) {
  for (var a = 0;a < this.variables_.length;a++) {
    var d = this.variables_[a];
    if (d.getId() == b || d.getName() == b) {
      return d;
    }
  }
};
Entry.Container.prototype.moveElement = function(b, a, d) {
  var c;
  c = this.getCurrentObjects();
  b = this.getAllObjects().indexOf(c[b]);
  a = this.getAllObjects().indexOf(c[a]);
  !d && Entry.stateManager && Entry.stateManager.addCommand("reorder object", Entry.container, Entry.container.moveElement, a, b, !0);
  this.objects_.splice(a, 0, this.objects_.splice(b, 1)[0]);
  this.setCurrentObjects();
  Entry.container.updateListView();
  Entry.requestUpdate = !0;
  return new Entry.State(Entry.container, Entry.container.moveElement, a, b, !0);
};
Entry.Container.prototype.moveElementByBlock = function(b, a) {
  var d = this.getCurrentObjects().splice(b, 1)[0];
  this.getCurrentObjects().splice(a, 0, d);
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getDropdownList = function(b, a) {
  var d = [];
  switch(b) {
    case "sprites":
      for (var c = this.getCurrentObjects(), e = c.length, f = 0;f < e;f++) {
        a = c[f], d.push([a.name, a.id]);
      }
      break;
    case "spritesWithMouse":
      c = this.getCurrentObjects();
      e = c.length;
      for (f = 0;f < e;f++) {
        a = c[f], d.push([a.name, a.id]);
      }
      d.push([Lang.Blocks.mouse_pointer, "mouse"]);
      break;
    case "spritesWithSelf":
      c = this.getCurrentObjects();
      e = c.length;
      for (f = 0;f < e;f++) {
        a = c[f], d.push([a.name, a.id]);
      }
      d.push([Lang.Blocks.self, "self"]);
      break;
    case "collision":
      d.push([Lang.Blocks.mouse_pointer, "mouse"]);
      c = this.getCurrentObjects();
      e = c.length;
      for (f = 0;f < e;f++) {
        a = c[f], d.push([a.name, a.id]);
      }
      d.push([Lang.Blocks.wall, "wall"]);
      d.push([Lang.Blocks.wall_up, "wall_up"]);
      d.push([Lang.Blocks.wall_down, "wall_down"]);
      d.push([Lang.Blocks.wall_right, "wall_right"]);
      d.push([Lang.Blocks.wall_left, "wall_left"]);
      break;
    case "pictures":
      a = Entry.playground.object || a;
      if (!a) {
        break;
      }
      c = a.pictures;
      for (f = 0;f < c.length;f++) {
        e = c[f], d.push([e.name, e.id]);
      }
      break;
    case "messages":
      c = Entry.variableContainer.messages_;
      for (f = 0;f < c.length;f++) {
        e = c[f], d.push([e.name, e.id]);
      }
      break;
    case "variables":
      c = Entry.variableContainer.variables_;
      for (f = 0;f < c.length;f++) {
        e = c[f], e.object_ && Entry.playground.object && e.object_ != Entry.playground.object.id || d.push([e.getName(), e.getId()]);
      }
      d && 0 !== d.length || d.push([Lang.Blocks.VARIABLE_variable, "null"]);
      break;
    case "lists":
      a = Entry.playground.object || a;
      c = Entry.variableContainer.lists_;
      for (f = 0;f < c.length;f++) {
        e = c[f], e.object_ && a && e.object_ != a.id || d.push([e.getName(), e.getId()]);
      }
      d && 0 !== d.length || d.push([Lang.Blocks.VARIABLE_list, "null"]);
      break;
    case "scenes":
      c = Entry.scene.scenes_;
      for (f = 0;f < c.length;f++) {
        e = c[f], d.push([e.name, e.id]);
      }
      break;
    case "sounds":
      a = Entry.playground.object || a;
      if (!a) {
        break;
      }
      c = a.sounds;
      for (f = 0;f < c.length;f++) {
        e = c[f], d.push([e.name, e.id]);
      }
      break;
    case "clone":
      d.push([Lang.Blocks.oneself, "self"]);
      e = this.objects_.length;
      for (f = 0;f < e;f++) {
        a = this.objects_[f], d.push([a.name, a.id]);
      }
      break;
    case "objectSequence":
      for (e = this.getCurrentObjects().length, f = 0;f < e;f++) {
        d.push([(f + 1).toString(), f.toString()]);
      }
    ;
  }
  d.length || (d = [[Lang.Blocks.no_target, "null"]]);
  return d;
};
Entry.Container.prototype.clearRunningState = function() {
  this.mapObject(function(b) {
    b.clearExecutor();
  });
};
Entry.Container.prototype.clearRunningStateOnScene = function() {
  this.mapObjectOnScene(function(b) {
    b.clearExecutor();
  });
};
Entry.Container.prototype.mapObject = function(b, a) {
  for (var d = this.objects_.length, c = [], e = 0;e < d;e++) {
    c.push(b(this.objects_[e], a));
  }
  return c;
};
Entry.Container.prototype.mapObjectOnScene = function(b, a) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < this._extensionObjects.length;f++) {
    var g = this._extensionObjects[f];
    e.push(b(g, a));
  }
  for (f = 0;f < c;f++) {
    g = d[f], e.push(b(g, a));
  }
  return e;
};
Entry.Container.prototype.mapEntity = function(b, a) {
  for (var d = this.objects_.length, c = [], e = 0;e < d;e++) {
    c.push(b(this.objects_[e].entity, a));
  }
  return c;
};
Entry.Container.prototype.mapEntityOnScene = function(b, a) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < c;f++) {
    e.push(b(d[f].entity, a));
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeClone = function(b, a) {
  for (var d = this.objects_, c = d.length, e = [], f = 0;f < c;f++) {
    var g = d[f], h = g.clonedEntities.length;
    e.push(b(g.entity, a));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(b(l, a));
    }
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeCloneOnScene = function(b, a) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < this._extensionObjects.length;f++) {
    var g = this._extensionObjects[f];
    e.push(b(g.entity, a));
  }
  for (f = 0;f < c;f++) {
    var g = d[f], h = g.clonedEntities.length;
    e.push(b(g.entity, a));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(b(l, a));
    }
  }
  return e;
};
Entry.Container.prototype.getCachedPicture = function(b) {
  Entry.assert("string" == typeof b, "pictureId must be string");
  return this.cachedPicture[b];
};
Entry.Container.prototype.cachePicture = function(b, a) {
  this.cachedPicture[b] = a;
};
Entry.Container.prototype.toJSON = function() {
  for (var b = [], a = this.objects_.length, d = 0;d < a;d++) {
    b.push(this.objects_[d].toJSON());
  }
  return b;
};
Entry.Container.prototype.takeSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = this.objects_, d = 0;d < b;d++) {
    a[d].index = d;
  }
};
Entry.Container.prototype.loadSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = Array(b), d = 0;d < b;d++) {
    var c = this.objects_[d];
    a[c.index || d] = c;
    delete c.index;
  }
  this.objects_ = a;
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getInputValue = function() {
  return this.inputValue.getValue();
};
Entry.Container.prototype.setInputValue = function(b) {
  this.inputValue.complete || (b ? this.inputValue.setValue(b) : this.inputValue.setValue(0), Entry.stage.hideInputField(), Entry.console && Entry.console.stopInput(b), this.inputValue.complete = !0);
};
Entry.Container.prototype.resetSceneDuringRun = function() {
  this.mapEntityOnScene(function(b) {
    b.loadSnapshot();
    b.object.filters = [];
    b.resetFilter();
    b.dialog && b.dialog.remove();
    b.shape && b.removeBrush();
  });
  this.clearRunningStateOnScene();
};
Entry.Container.prototype.setCopiedObject = function(b) {
  this.copiedObject = b;
};
Entry.Container.prototype.updateObjectsOrder = function() {
  for (var b = Entry.scene.getScenes(), a = [], d = 0;d < b.length;d++) {
    for (var c = this.getSceneObjects(b[d]), e = 0;e < c.length;e++) {
      a.push(c[e]);
    }
  }
  this.objects_ = a;
};
Entry.Container.prototype.getSceneObjects = function(b) {
  b = b || Entry.scene.selectedScene;
  for (var a = [], d = this.getAllObjects(), c = 0;c < d.length;c++) {
    b.id == d[c].scene.id && a.push(d[c]);
  }
  return a;
};
Entry.Container.prototype.setCurrentObjects = function() {
  this.currentObjects_ = this.getSceneObjects();
};
Entry.Container.prototype.getCurrentObjects = function() {
  var b = this.currentObjects_;
  b && 0 !== b.length || this.setCurrentObjects();
  return this.currentObjects_;
};
Entry.Container.prototype.getProjectWithJSON = function(b) {
  b.objects = Entry.container.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.scenes = Entry.scene.toJSON();
  return b;
};
Entry.Container.prototype.blurAllInputs = function() {
  this.getSceneObjects().map(function(b) {
    b = b.view_.getElementsByTagName("input");
    for (var a = 0, d = b.length;a < d;a++) {
      b[a].blur();
    }
  });
};
Entry.Container.prototype.showProjectAnswer = function() {
  var b = this.inputValue;
  b && b.setVisible(!0);
};
Entry.Container.prototype.hideProjectAnswer = function(b) {
  if ((b = this.inputValue) && b.isVisible() && !Entry.engine.isState("run")) {
    for (var a = Entry.container.getAllObjects(), d = ["ask_and_wait", "get_canvas_input_value", "set_visible_answer"], c = 0, e = a.length;c < e;c++) {
      for (var f = a[c].script, g = 0;g < d.length;g++) {
        if (f.hasBlockType(d[g])) {
          return;
        }
      }
    }
    b.setVisible(!1);
  }
};
Entry.Container.prototype.getView = function() {
  return this._view;
};
Entry.Container.prototype.resize = function() {
};
Entry.Container.prototype._rightClick = function(b) {
  b.stopPropagation && b.stopPropagation();
  var a = [{text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
    Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
  }}];
  Entry.ContextMenu.show(a, "workspace-contextmenu", {x:b.clientX, y:b.clientY});
};
Entry.Container.prototype.removeFuncBlocks = function(b) {
  this.objects_.forEach(function(a) {
    a.script.removeBlocksByType(b);
  });
};
Entry.Container.prototype.clear = function() {
  this.objects_.map(function(b) {
    b.destroy();
  });
  this.objects_ = [];
  Entry.playground.flushPlayground();
};
Entry.db = {data:{}, typeMap:{}};
(function(b) {
  b.add = function(a) {
    this.data[a.id] = a;
    var b = a.type;
    void 0 === this.typeMap[b] && (this.typeMap[b] = {});
    this.typeMap[b][a.id] = a;
  };
  b.has = function(a) {
    return this.data.hasOwnProperty(a);
  };
  b.remove = function(a) {
    this.has(a) && (delete this.typeMap[this.data[a].type][a], delete this.data[a]);
  };
  b.get = function(a) {
    return this.data[a];
  };
  b.find = function() {
  };
  b.clear = function() {
    this.data = {};
    this.typeMap = {};
  };
})(Entry.db);
Entry.Dom = function(b, a) {
  var d = /<(\w+)>/, c;
  c = b instanceof HTMLElement ? $(b) : b instanceof jQuery ? b : d.test(b) ? $(b) : $("<" + b + "></" + b + ">");
  if (void 0 === a) {
    return c;
  }
  a.id && c.attr("id", a.id);
  a.class && c.addClass(a.class);
  a.classes && a.classes.map(function(a) {
    c.addClass(a);
  });
  a.src && c.attr("src", a.src);
  a.parent && a.parent.append(c);
  c.bindOnClick = function() {
    var a, b, d = function(a) {
      a.stopImmediatePropagation();
      a.handled || (a.handled = !0, b.call(this, a));
    };
    1 < arguments.length ? (b = arguments[1] instanceof Function ? arguments[1] : function() {
    }, a = "string" === typeof arguments[0] ? arguments[0] : "") : b = arguments[0] instanceof Function ? arguments[0] : function() {
    };
    if (a) {
      $(this).on("click tab", a, d);
    } else {
      $(this).on("click tab", d);
    }
  };
  return c;
};
Entry.SVG = function(b, a) {
  var d = a ? a : document.getElementById(b);
  return Entry.SVG.createElement(d);
};
Entry.SVG.NS = "http://www.w3.org/2000/svg";
Entry.SVG.NS_XLINK = "http://www.w3.org/1999/xlink";
Entry.SVG.createElement = function(b, a) {
  var d;
  d = "string" === typeof b ? document.createElementNS(Entry.SVG.NS, b) : b;
  if (a) {
    a.href && (d.setAttributeNS(Entry.SVG.NS_XLINK, "href", a.href), delete a.href);
    for (var c in a) {
      d.setAttribute(c, a[c]);
    }
  }
  this instanceof SVGElement && this.appendChild(d);
  d.elem = Entry.SVG.createElement;
  d.attr = Entry.SVG.attr;
  d.addClass = Entry.SVG.addClass;
  d.removeClass = Entry.SVG.removeClass;
  d.hasClass = Entry.SVG.hasClass;
  d.remove = Entry.SVG.remove;
  d.removeAttr = Entry.SVG.removeAttr;
  "text" === b && d.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
  return d;
};
Entry.SVG.attr = function(b, a) {
  if ("string" === typeof b) {
    var d = {};
    d[b] = a;
    b = d;
  }
  if (b) {
    b.href && (this.setAttributeNS(Entry.SVG.NS_XLINK, "href", b.href), delete b.href);
    for (var c in b) {
      this.setAttribute(c, b[c]);
    }
  }
  return this;
};
Entry.SVG.addClass = function(b) {
  for (var a = this.getAttribute("class"), d = 0;d < arguments.length;d++) {
    b = arguments[d], this.hasClass(b) || (a += " " + b);
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.removeClass = function(b) {
  for (var a = this.getAttribute("class"), d = 0;d < arguments.length;d++) {
    b = arguments[d], this.hasClass(b) && (a = a.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.hasClass = function(b) {
  var a = this.getAttribute("class");
  return a ? a.match(new RegExp("(\\s|^)" + b + "(\\s|$)")) : !1;
};
Entry.SVG.remove = function() {
  this.parentNode && this.parentNode.removeChild(this);
};
Entry.SVG.removeAttr = function(b) {
  this.removeAttribute(b);
};
Entry.Dialog = function(b, a, d, c) {
  b.dialog && b.dialog.remove();
  b.dialog = this;
  this.parent = b;
  this.padding = 10;
  this.border = 2;
  "number" == typeof a && (a = String(a));
  Entry.console && Entry.console.print(a, d);
  this.message_ = a = a.match(/.{1,15}/g).join("\n");
  this.mode_ = d;
  "speak" !== d && "ask" !== d || this.generateSpeak();
  c || Entry.stage.loadDialog(this);
};
Entry.Dialog.prototype.generateSpeak = function() {
  this.object = new createjs.Container;
  var b = new createjs.Text;
  b.font = "15px NanumGothic";
  b.textBaseline = "top";
  b.textAlign = "left";
  b.text = this.message_;
  var a = b.getTransformedBounds(), d = a.height, a = 10 <= a.width ? a.width : 17, c = new createjs.Shape;
  c.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").rr(-this.padding, -this.padding, a + 2 * this.padding, d + 2 * this.padding, this.padding);
  this.object.addChild(c);
  this.object.regX = a / 2;
  this.object.regY = d / 2;
  this.width = a;
  this.height = d;
  this.notch = this.createSpeakNotch("ne");
  this.update();
  this.object.addChild(this.notch);
  this.object.addChild(b);
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.update = function() {
  var b = this.parent.object.getTransformedBounds();
  if (!b && "textBox" === this.parent.type) {
    if (this._isNoContentTried) {
      delete this._isNoContentTried;
      return;
    }
    this.parent.setText(" ");
    b = this.parent.object.getTransformedBounds();
    this._isNoContentTried = !0;
  }
  var a = "";
  -135 < b.y - this.height - 20 - this.border ? (this.object.y = b.y - this.height / 2 - 20 - this.padding, a += "n") : (this.object.y = b.y + b.height + this.height / 2 + 20 + this.padding, a += "s");
  240 > b.x + b.width + this.width ? (this.object.x = b.x + b.width + this.width / 2, a += "e") : (this.object.x = b.x - this.width / 2, a += "w");
  this.notch.type != a && (this.object.removeChild(this.notch), this.notch = this.createSpeakNotch(a), this.object.addChild(this.notch));
  this._isNoContentTried && this.parent.setText("");
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.createSpeakNotch = function(b) {
  var a = new createjs.Shape;
  a.type = b;
  "ne" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, this.height + this.padding - 1.5).lt(-10, this.height + this.padding + 20).lt(20, this.height + this.padding - 1.5) : "nw" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, this.height + this.padding - 1.5).lt(this.width + 10, this.height + this.padding + 20).lt(this.width - 20, this.height + this.padding - 1.5) : "se" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, -this.padding + 1.5).lt(-10, 
  -this.padding - 20).lt(20, -this.padding + 1.5) : "sw" == b && a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, -this.padding + 1.5).lt(this.width + 10, -this.padding - 20).lt(this.width - 20, -this.padding + 1.5);
  return a;
};
Entry.Dialog.prototype.remove = function() {
  Entry.stage.unloadDialog(this);
  this.parent.dialog = null;
  Entry.requestUpdate = !0;
};
Entry.DoneProject = function(b) {
  this.generateView(b);
};
var p = Entry.DoneProject.prototype;
p.init = function(b) {
  this.projectId = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerDoneWorkspace");
  this.doneContainer = a;
  var d = Entry.createElement("iframe");
  d.setAttribute("id", "doneProjectframe");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", "/api/iframe/project/" + b);
  this.doneProjectFrame = d;
  this.doneContainer.appendChild(d);
  a.addClass("entryRemove");
};
p.getView = function() {
  return this.doneContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var b = document.getElementById("doneProjectframe"), a = this.doneContainer.offsetWidth;
  b.width = a + "px";
  b.height = 9 * a / 16 + "px";
};
Entry.Engine = function() {
  function b(a) {
    var b = [37, 38, 39, 40, 32], c = a.keyCode || a.which, e = Entry.stage.inputField;
    32 == c && e && e.hasFocus() || -1 < b.indexOf(c) && a.preventDefault();
  }
  this.state = "stop";
  this.popup = null;
  this.isUpdating = !0;
  this.speeds = [1, 15, 30, 45, 60];
  this._mouseMoved = !1;
  Entry.keyPressed && Entry.keyPressed.attach(this, this.captureKeyEvent);
  Entry.addEventListener("canvasClick", function(a) {
    Entry.engine.fireEvent("mouse_clicked");
  });
  Entry.addEventListener("canvasClickCanceled", function(a) {
    Entry.engine.fireEvent("mouse_click_cancled");
  });
  Entry.addEventListener("entityClick", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click", a);
  });
  Entry.addEventListener("entityClickCanceled", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click_canceled", a);
  });
  "phone" != Entry.type && (Entry.addEventListener("stageMouseMove", function(a) {
    this._mouseMoved = !0;
  }.bind(this)), Entry.addEventListener("stageMouseOut", function(a) {
    Entry.engine.hideMouseView();
  }));
  Entry.addEventListener("run", function() {
    $(window).bind("keydown", b);
  });
  Entry.addEventListener("stop", function() {
    $(window).unbind("keydown", b);
  });
  setInterval(function() {
    this._mouseMoved && (this.updateMouseView(), this._mouseMoved = !1);
  }.bind(this), 100);
  Entry.message = new Entry.Event(window);
};
Entry.Engine.prototype.generateView = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (this.view_ = b, this.view_.addClass("entryEngine"), this.view_.addClass("entryEngineMinimize"), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonMinimize"), this.maximizeButton.addClass("entryMaximizeButtonMinimize"), this.view_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
    }), this.coordinateButton = Entry.createElement("button"), this.coordinateButton.addClass("entryEngineButtonMinimize"), this.coordinateButton.addClass("entryCoordinateButtonMinimize"), this.view_.appendChild(this.coordinateButton), this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      Entry.stage.toggleCoordinator();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonMinimize"), this.stopButton.addClass("entryStopButtonMinimize"), this.stopButton.addClass("entryRemove"), this.stopButton.innerHTML = Lang.Workspace.stop, this.view_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.toggleStop();
    }), this.pauseButton = Entry.createElement("button"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.pauseButton.addClass("entryEngineButtonMinimize"), this.pauseButton.addClass("entryPauseButtonMinimize"), this.pauseButton.addClass("entryRemove"), this.view_.appendChild(this.pauseButton), this.pauseButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.togglePause();
    }), this.mouseView = Entry.createElement("div"), this.mouseView.addClass("entryMouseViewMinimize"), this.mouseView.addClass("entryRemove"), this.view_.appendChild(this.mouseView), Entry.addEventListener("loadComplete", function() {
      this.runButton = Entry.Dom("div", {class:"entryRunButtonBigMinimize", parent:$("#entryCanvasWrapper")});
      this.runButton.bindOnClick(function(a) {
        Entry.engine.toggleRun();
      });
    }.bind(this))) : "phone" == a && (this.view_ = b, this.view_.addClass("entryEngine", "entryEnginePhone"), this.headerView_ = Entry.createElement("div", "entryEngineHeader"), this.headerView_.addClass("entryEngineHeaderPhone"), this.view_.appendChild(this.headerView_), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonPhone", "entryMaximizeButtonPhone"), this.headerView_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.footerView_.addClass("entryRemove");
      Entry.engine.headerView_.addClass("entryRemove");
      Entry.launchFullScreen(Entry.engine.view_);
    }), document.addEventListener("fullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("webkitfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("mozfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), this.footerView_ = Entry.createElement("div", "entryEngineFooter"), this.footerView_.addClass("entryEngineFooterPhone"), this.view_.appendChild(this.footerView_), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonPhone", "entryRunButtonPhone"), Entry.objectAddable && this.runButton.addClass("small"), this.runButton.innerHTML = Lang.Workspace.run, this.footerView_.appendChild(this.runButton), this.runButton.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonPhone", "entryStopButtonPhone", "entryRemove"), Entry.objectAddable && this.stopButton.addClass("small"), this.stopButton.innerHTML = Lang.Workspace.stop, this.footerView_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      Entry.engine.toggleStop();
    }));
  } else {
    this.view_ = b;
    this.view_.addClass("entryEngine_w");
    this.view_.addClass("entryEngineWorkspace_w");
    var d = Entry.createElement("button");
    this.speedButton = d;
    this.speedButton.addClass("entrySpeedButtonWorkspace", "entryEngineTopWorkspace", "entryEngineButtonWorkspace_w");
    this.view_.appendChild(this.speedButton);
    this.speedButton.bindOnClick(function(a) {
      Entry.engine.toggleSpeedPanel();
      d.blur();
    });
    this.maximizeButton = Entry.createElement("button");
    this.maximizeButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryMaximizeButtonWorkspace_w");
    this.view_.appendChild(this.maximizeButton);
    this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
      this.blur();
    });
    var c = Entry.createElement("button");
    this.coordinateButton = c;
    this.coordinateButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryCoordinateButtonWorkspace_w");
    this.view_.appendChild(this.coordinateButton);
    this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      c.blur();
      this.blur();
      Entry.stage.toggleCoordinator();
    });
    this.addButton = Entry.createElement("button");
    this.addButton.addClass("entryEngineButtonWorkspace_w");
    this.addButton.addClass("entryAddButtonWorkspace_w");
    this.addButton.innerHTML = Lang.Workspace.add_object;
    this.addButton.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
      this.blur();
    });
    this.view_.appendChild(this.addButton);
    this.runButton = Entry.createElement("button");
    this.runButton.addClass("entryEngineButtonWorkspace_w");
    this.runButton.addClass("entryRunButtonWorkspace_w");
    this.runButton.innerHTML = Lang.Workspace.run;
    this.view_.appendChild(this.runButton);
    this.runButton.bindOnClick(function(a) {
      Entry.engine.toggleRun();
      this.blur();
    });
    this.runButton2 = Entry.createElement("button");
    this.runButton2.addClass("entryEngineButtonWorkspace_w");
    this.runButton2.addClass("entryRunButtonWorkspace_w2");
    this.view_.appendChild(this.runButton2);
    this.runButton2.bindOnClick(function(a) {
      this.blur();
      Entry.engine.toggleRun();
    });
    this.stopButton = Entry.createElement("button");
    this.stopButton.addClass("entryEngineButtonWorkspace_w");
    this.stopButton.addClass("entryStopButtonWorkspace_w");
    this.stopButton.addClass("entryRemove");
    this.stopButton.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton);
    this.stopButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.toggleStop();
    });
    this.stopButton2 = Entry.createElement("button");
    this.stopButton2.addClass("entryEngineButtonWorkspace_w");
    this.stopButton2.addClass("entryStopButtonWorkspace_w2");
    this.stopButton2.addClass("entryRemove");
    this.stopButton2.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton2);
    this.stopButton2.bindOnClick(function(a) {
      this.blur();
      Entry.engine.toggleStop();
    });
    this.pauseButton = Entry.createElement("button");
    this.pauseButton.addClass("entryEngineButtonWorkspace_w");
    this.pauseButton.addClass("entryPauseButtonWorkspace_w");
    this.pauseButton.addClass("entryRemove");
    this.view_.appendChild(this.pauseButton);
    this.pauseButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.togglePause();
    });
    this.mouseView = Entry.createElement("div");
    this.mouseView.addClass("entryMouseViewWorkspace_w");
    this.mouseView.addClass("entryRemove");
    this.view_.appendChild(this.mouseView);
  }
};
Entry.Engine.prototype.toggleSpeedPanel = function() {
  if (this.speedPanelOn) {
    this.speedPanelOn = !1, $(Entry.stage.canvas.canvas).animate({top:"24px"}), this.coordinateButton.removeClass("entryRemove"), this.maximizeButton.removeClass("entryRemove"), this.mouseView.removeClass("entryRemoveElement"), $(this.speedLabel_).remove(), delete this.speedLabel_, $(this.speedProgress_).fadeOut(null, function(a) {
      $(this).remove();
      delete this.speedProgress_;
    }), $(this.speedHandle_).remove(), delete this.speedHandle_;
  } else {
    this.speedPanelOn = !0;
    $(Entry.stage.canvas.canvas).animate({top:"41px"});
    this.coordinateButton.addClass("entryRemove");
    this.maximizeButton.addClass("entryRemove");
    this.mouseView.addClass("entryRemoveElement");
    this.speedLabel_ = Entry.createElement("div", "entrySpeedLabelWorkspace");
    this.speedLabel_.innerHTML = Lang.Workspace.speed;
    this.view_.insertBefore(this.speedLabel_, this.maximizeButton);
    this.speedProgress_ = Entry.createElement("table", "entrySpeedProgressWorkspace");
    for (var b = Entry.createElement("tr"), a = this.speeds, d = 0;5 > d;d++) {
      (function(d) {
        var c = Entry.createElement("td", "progressCell" + d);
        c.bindOnClick(function() {
          Entry.engine.setSpeedMeter(a[d]);
        });
        b.appendChild(c);
      })(d);
    }
    this.view_.insertBefore(this.speedProgress_, this.maximizeButton);
    this.speedProgress_.appendChild(b);
    this.speedHandle_ = Entry.createElement("div", "entrySpeedHandleWorkspace");
    var c = (Entry.interfaceState.canvasWidth - 84) / 5;
    $(this.speedHandle_).bind("mousedown.speedPanel touchstart.speedPanel", function(a) {
      function b(a) {
        a.stopPropagation();
        a = Entry.Utils.convertMouseEvent(a);
        a = Math.floor((a.clientX - 80) / (5 * c) * 5);
        0 > a || 4 < a || Entry.engine.setSpeedMeter(Entry.engine.speeds[a]);
      }
      function d(a) {
        $(document).unbind(".speedPanel");
      }
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        Entry.Utils.convertMouseEvent(a), a = $(document), a.bind("mousemove.speedPanel touchmove.speedPanel", b), a.bind("mouseup.speedPanel touchend.speedPanel", d);
      }
    });
    this.view_.insertBefore(this.speedHandle_, this.maximizeButton);
    this.setSpeedMeter(Entry.FPS);
  }
};
Entry.Engine.prototype.setSpeedMeter = function(b) {
  var a = this.speeds.indexOf(b);
  0 > a || (a = Math.min(4, a), a = Math.max(0, a), this.speedPanelOn && (this.speedHandle_.style.left = (Entry.interfaceState.canvasWidth - 80) / 10 * (2 * a + 1) + 80 - 9 + "px"), Entry.FPS != b && (clearInterval(this.ticker), this.ticker = setInterval(this.update, Math.floor(1E3 / b)), Entry.FPS = b));
};
Entry.Engine.prototype.start = function(b) {
  createjs.Ticker.setFPS(Entry.FPS);
  this.ticker || (this.ticker = setInterval(this.update, Math.floor(1E3 / Entry.FPS)));
};
Entry.Engine.prototype.stop = function() {
  createjs.Ticker.reset();
  clearInterval(this.ticker);
  this.ticker = null;
};
Entry.Engine.prototype.update = function() {
  Entry.engine.isState("run") && (Entry.engine.computeObjects(), Entry.hw.update());
};
Entry.Engine.prototype.computeObjects = function() {
  Entry.container.mapObjectOnScene(this.computeFunction);
};
Entry.Engine.prototype.computeFunction = function(b) {
  b.script.tick();
};
Entry.Engine.computeThread = function(b, a) {
  Entry.engine.isContinue = !0;
  for (var d = !1;a && Entry.engine.isContinue && !d;) {
    Entry.engine.isContinue = !a.isRepeat;
    var c = a.run(), d = c && c === a;
    a = c;
  }
  return a;
};
Entry.Engine.prototype.isState = function(b) {
  return -1 < this.state.indexOf(b);
};
Entry.Engine.prototype.run = function() {
  this.isState("run") ? this.toggleStop() : (this.isState("stop") || this.isState("pause")) && this.toggleRun();
};
Entry.Engine.prototype.toggleRun = function() {
  if ("pause" === this.state) {
    this.togglePause();
  } else {
    if (Entry.playground && Entry.playground.mainWorkspace) {
      var b = Entry.playground.mainWorkspace, a = b.mode;
      a == Entry.Workspace.MODE_VIMBOARD && b.loadCodeFromText(a);
    }
    Entry.addActivity("run");
    "stop" == this.state && (Entry.container.mapEntity(function(a) {
      a.takeSnapshot();
    }), Entry.variableContainer.mapVariable(function(a) {
      a.takeSnapshot();
    }), Entry.variableContainer.mapList(function(a) {
      a.takeSnapshot();
    }), this.projectTimer.takeSnapshot(), Entry.container.inputValue.takeSnapshot(), Entry.container.takeSequenceSnapshot(), Entry.scene.takeStartSceneSnapshot(), this.state = "run", this.fireEvent("start"));
    this.state = "run";
    "mobile" == Entry.type && this.view_.addClass("entryEngineBlueWorkspace");
    this.runButton && (this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("run"), this.runButton.addClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.pauseButton && this.pauseButton.removeClass("entryRemove"), this.runButton2 && this.runButton2.addClass("entryRemove"), this.stopButton2 && this.stopButton2.removeClass("entryRemove"));
    this.isUpdating || (Entry.engine.update(), Entry.engine.isUpdating = !0);
    Entry.stage.selectObject();
    Entry.dispatchEvent("run");
  }
};
Entry.Engine.prototype.toggleStop = function() {
  Entry.addActivity("stop");
  var b = Entry.container, a = Entry.variableContainer;
  b.mapEntity(function(a) {
    a.loadSnapshot();
    a.object.filters = [];
    a.resetFilter();
    a.dialog && a.dialog.remove();
    a.brush && a.removeBrush();
  });
  a.mapVariable(function(a) {
    a.loadSnapshot();
  });
  a.mapList(function(a) {
    a.loadSnapshot();
  });
  this.stopProjectTimer();
  b.clearRunningState();
  b.loadSequenceSnapshot();
  this.projectTimer.loadSnapshot();
  Entry.container.inputValue.loadSnapshot();
  Entry.scene.loadStartSceneSnapshot();
  Entry.Func.clearThreads();
  createjs.Sound.setVolume(1);
  createjs.Sound.stop();
  this.view_.removeClass("entryEngineBlueWorkspace");
  this.runButton && (this.runButton.removeClass("entryRemove"), this.stopButton.addClass("entryRemove"), this.pauseButton && this.pauseButton.addClass("entryRemove"), this.runButton2 && this.runButton2.removeClass("entryRemove"), this.stopButton2 && this.stopButton2.addClass("entryRemove"));
  this.state = "stop";
  Entry.dispatchEvent("stop");
  Entry.stage.hideInputField();
};
Entry.Engine.prototype.togglePause = function() {
  var b = Entry.engine.projectTimer;
  "pause" == this.state ? (b.pausedTime += (new Date).getTime() - b.pauseStart, b.isPaused ? b.pauseStart = (new Date).getTime() : delete b.pauseStart, this.state = "run", this.runButton && (this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("entryRemove"), this.runButton2 && this.runButton2.addClass("entryRemove"))) : (this.state = "pause", b.isPaused && (b.pausedTime += (new Date).getTime() - b.pauseStart), b.pauseStart = (new Date).getTime(), this.runButton && (this.pauseButton.innerHTML = 
  Lang.Workspace.restart, this.runButton.removeClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.runButton2 && this.runButton2.removeClass("entryRemove")));
};
Entry.Engine.prototype.fireEvent = function(b) {
  "run" === this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEvent, b);
};
Entry.Engine.prototype.raiseEvent = function(b, a) {
  b.parent.script.raiseEvent(a, b);
};
Entry.Engine.prototype.fireEventOnEntity = function(b, a) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [a, b]);
};
Entry.Engine.prototype.raiseEventOnEntity = function(b, a) {
  b === a[0] && b.parent.script.raiseEvent(a[1], b);
};
Entry.Engine.prototype.captureKeyEvent = function(b) {
  var a = b.keyCode, d = Entry.type;
  b.ctrlKey && "workspace" == d ? 83 == a ? (b.preventDefault(), Entry.dispatchEvent("saveWorkspace")) : 82 == a ? (b.preventDefault(), Entry.engine.run()) : 90 == a && (b.preventDefault(), Entry.dispatchEvent(b.shiftKey ? "redo" : "undo")) : Entry.engine.isState("run") && Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["keyPress", a]);
  Entry.engine.isState("stop") && "workspace" === d && 37 <= a && 40 >= a && Entry.stage.moveSprite(b);
};
Entry.Engine.prototype.raiseKeyEvent = function(b, a) {
  return b.parent.script.raiseEvent(a[0], b, String(a[1]));
};
Entry.Engine.prototype.updateMouseView = function() {
  var b = Entry.stage.mouseCoordinate;
  this.mouseView.textContent = "X : " + b.x + ", Y : " + b.y;
  this.mouseView.removeClass("entryRemove");
};
Entry.Engine.prototype.hideMouseView = function() {
  this.mouseView.addClass("entryRemove");
};
Entry.Engine.prototype.toggleFullscreen = function() {
  if (this.popup) {
    this.popup.remove(), this.popup = null;
  } else {
    this.popup = new Entry.Popup;
    if ("workspace" != Entry.type) {
      var b = $(document);
      $(this.popup.body_).css("top", b.scrollTop());
      $("body").css("overflow", "hidden");
      popup.window_.appendChild(Entry.stage.canvas.canvas);
      popup.window_.appendChild(Entry.engine.runButton[0]);
    }
    popup.window_.appendChild(Entry.engine.view_);
  }
  Entry.windowResized.notify();
};
Entry.Engine.prototype.exitFullScreen = function() {
  document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen || (Entry.engine.footerView_.removeClass("entryRemove"), Entry.engine.headerView_.removeClass("entryRemove"));
  Entry.windowResized.notify();
};
Entry.Engine.prototype.showProjectTimer = function() {
  Entry.engine.projectTimer && this.projectTimer.setVisible(!0);
};
Entry.Engine.prototype.hideProjectTimer = function() {
  var b = this.projectTimer;
  if (b && b.isVisible() && !this.isState("run")) {
    for (var a = Entry.container.getAllObjects(), d = ["get_project_timer_value", "reset_project_timer", "set_visible_project_timer", "choose_project_timer_action"], c = 0, e = a.length;c < e;c++) {
      for (var f = a[c].script, g = 0;g < d.length;g++) {
        if (f.hasBlockType(d[g])) {
          return;
        }
      }
    }
    b.setVisible(!1);
  }
};
Entry.Engine.prototype.clearTimer = function() {
  clearInterval(this.ticker);
  clearInterval(this.projectTimer.tick);
};
Entry.Engine.prototype.startProjectTimer = function() {
  var b = this.projectTimer;
  b && (b.start = (new Date).getTime(), b.isInit = !0, b.pausedTime = 0, b.tick = setInterval(function(a) {
    Entry.engine.updateProjectTimer();
  }, 1E3 / 60));
};
Entry.Engine.prototype.stopProjectTimer = function() {
  var b = this.projectTimer;
  b && (this.updateProjectTimer(0), b.isPaused = !1, b.isInit = !1, b.pausedTime = 0, clearInterval(b.tick));
};
Entry.Engine.prototype.updateProjectTimer = function(b) {
  var a = Entry.engine, d = a.projectTimer;
  if (d) {
    var c = (new Date).getTime();
    "undefined" == typeof b ? d.isPaused || a.isState("pause") || d.setValue((c - d.start - d.pausedTime) / 1E3) : (d.setValue(b), d.pausedTime = 0, d.start = c);
  }
};
Entry.Engine.prototype.raiseMessage = function(b) {
  Entry.message.notify(Entry.variableContainer.getMessage(b));
  return Entry.container.mapEntityIncludeCloneOnScene(this.raiseKeyEvent, ["when_message_cast", b]);
};
Entry.EntityObject = function(b) {
  this.parent = b;
  this.type = b.objectType;
  this.flip = !1;
  this.collision = Entry.Utils.COLLISION.NONE;
  this.id = Entry.generateHash();
  "sprite" == this.type ? (this.object = new createjs.Bitmap, this.effect = {}, this.setInitialEffectValue()) : "textBox" == this.type && (this.object = new createjs.Container, this.textObject = new createjs.Text, this.textObject.font = "20px Nanum Gothic", this.textObject.textBaseline = "middle", this.textObject.textAlign = "center", this.bgObject = new createjs.Shape, this.bgObject.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect(0, 0, 100, 100), this.object.addChild(this.bgObject), this.object.addChild(this.textObject), 
  this.fontType = "Nanum Gothic", this.fontSize = 20, this.strike = this.underLine = this.fontItalic = this.fontBold = !1);
  this.object.entity = this;
  this.object.cursor = "pointer";
  this.object.on("mousedown", function(a) {
    var b = this.entity.parent.id;
    Entry.dispatchEvent("entityClick", this.entity);
    Entry.stage.isObjectClick = !0;
    "minimize" != Entry.type && Entry.engine.isState("stop") && (this.offset = {x:-this.parent.x + this.entity.getX() - (.75 * a.stageX - 240), y:-this.parent.y - this.entity.getY() - (.75 * a.stageY - 135)}, this.cursor = "move", this.entity.initCommand(), Entry.container.selectObject(b));
  });
  this.object.on("pressup", function(a) {
    Entry.dispatchEvent("entityClickCanceled", this.entity);
    this.cursor = "pointer";
    this.entity.checkCommand();
  });
  this.object.on("pressmove", function(a) {
    "minimize" != Entry.type && Entry.engine.isState("stop") && !this.entity.parent.getLock() && (this.entity.doCommand(), this.entity.setX(.75 * a.stageX - 240 + this.offset.x), this.entity.setY(-(.75 * a.stageY - 135) - this.offset.y), Entry.stage.updateObject());
  });
};
Entry.EntityObject.prototype.injectModel = function(b, a) {
  if ("sprite" == this.type) {
    this.setImage(b);
  } else {
    if ("textBox" == this.type) {
      var d = this.parent;
      a.text = a.text || d.text || d.name;
      this.setFont(a.font);
      this.setBGColour(a.bgColor);
      this.setColour(a.colour);
      this.setUnderLine(a.underLine);
      this.setStrike(a.strike);
      this.setText(a.text);
    }
  }
  a && this.syncModel_(a);
};
Entry.EntityObject.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.setRegX(b.regX);
  this.setRegY(b.regY);
  this.setScaleX(b.scaleX);
  this.setScaleY(b.scaleY);
  this.setRotation(b.rotation);
  this.setDirection(b.direction, !0);
  this.setLineBreak(b.lineBreak);
  this.setWidth(b.width);
  this.setHeight(b.height);
  this.setText(b.text);
  this.setTextAlign(b.textAlign);
  this.setFontSize(b.fontSize || this.getFontSize());
  this.setVisible(b.visible);
};
Entry.EntityObject.prototype.initCommand = function() {
  Entry.engine.isState("stop") && (this.isCommandValid = !1, Entry.stateManager && Entry.stateManager.addCommand("edit entity", this, this.restoreEntity, this.toJSON()));
};
Entry.EntityObject.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.EntityObject.prototype.checkCommand = function() {
  Entry.engine.isState("stop") && !this.isCommandValid && Entry.dispatchEvent("cancelLastCommand");
};
Entry.EntityObject.prototype.restoreEntity = function(b) {
  var a = this.toJSON();
  this.syncModel_(b);
  Entry.dispatchEvent("updateObject");
  Entry.stateManager && Entry.stateManager.addCommand("restore object", this, this.restoreEntity, a);
};
Entry.EntityObject.prototype.setX = function(b) {
  "number" == typeof b && (this.x = b, this.object.x = this.x, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getX = function() {
  return this.x;
};
Entry.EntityObject.prototype.setY = function(b) {
  "number" == typeof b && (this.y = b, this.object.y = -this.y, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getY = function() {
  return this.y;
};
Entry.EntityObject.prototype.getDirection = function() {
  return this.direction;
};
Entry.EntityObject.prototype.setDirection = function(b, a) {
  b || (b = 0);
  "vertical" != this.parent.getRotateMethod() || a || (0 <= this.direction && 180 > this.direction) == (0 <= b && 180 > b) || (this.setScaleX(-this.getScaleX()), Entry.stage.updateObject(), this.flip = !this.flip);
  this.direction = b.mod(360);
  this.object.direction = this.direction;
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.setRotation = function(b) {
  "free" != this.parent.getRotateMethod() && (b = 0);
  this.rotation = b.mod(360);
  this.object.rotation = this.rotation;
  this.updateDialog();
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRotation = function() {
  return this.rotation;
};
Entry.EntityObject.prototype.setRegX = function(b) {
  "textBox" == this.type && (b = 0);
  this.regX = b;
  this.object.regX = this.regX;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegX = function() {
  return this.regX;
};
Entry.EntityObject.prototype.setRegY = function(b) {
  "textBox" == this.type && (b = 0);
  this.regY = b;
  this.object.regY = this.regY;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegY = function() {
  return this.regY;
};
Entry.EntityObject.prototype.setScaleX = function(b) {
  this.scaleX = b;
  this.object.scaleX = this.scaleX;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleX = function() {
  return this.scaleX;
};
Entry.EntityObject.prototype.setScaleY = function(b) {
  this.scaleY = b;
  this.object.scaleY = this.scaleY;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleY = function() {
  return this.scaleY;
};
Entry.EntityObject.prototype.setSize = function(b) {
  1 > b && (b = 1);
  b /= this.getSize();
  this.setScaleX(this.getScaleX() * b);
  this.setScaleY(this.getScaleY() * b);
  this.isClone || this.parent.updateCoordinateView();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getSize = function() {
  return (this.getWidth() * Math.abs(this.getScaleX()) + this.getHeight() * Math.abs(this.getScaleY())) / 2;
};
Entry.EntityObject.prototype.setWidth = function(b) {
  this.width = b;
  this.object.width = this.width;
  this.textObject && this.getLineBreak() && (this.textObject.lineWidth = this.width);
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getWidth = function() {
  return this.width;
};
Entry.EntityObject.prototype.setHeight = function(b) {
  this.height = b;
  this.textObject && (this.object.height = this.height, this.alignTextBox());
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getHeight = function() {
  return this.height;
};
Entry.EntityObject.prototype.setColour = function(b) {
  b || (b = "#000000");
  this.colour = b;
  this.textObject && (this.textObject.color = this.colour);
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getColour = function() {
  return this.colour;
};
Entry.EntityObject.prototype.setBGColour = function(b) {
  b || (b = "transparent");
  this.bgColor = b;
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getBGColour = function() {
  return this.bgColor;
};
Entry.EntityObject.prototype.setUnderLine = function(b) {
  void 0 === b && (b = !1);
  this.underLine = b;
  this.textObject.underLine = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getUnderLine = function() {
  return this.underLine;
};
Entry.EntityObject.prototype.setStrike = function(b) {
  void 0 === b && (b = !1);
  this.strike = b;
  this.textObject.strike = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getStrike = function() {
  return this.strike;
};
Entry.EntityObject.prototype.getFont = function() {
  var b = [];
  this.fontBold && b.push("bold");
  this.fontItalic && b.push("italic");
  b.push(this.getFontSize() + "px");
  b.push(this.fontType);
  return b.join(" ");
};
Entry.EntityObject.prototype.setFont = function(b) {
  if ("textBox" == this.parent.objectType && this.font !== b) {
    b || (b = "20px Nanum Gothic");
    var a = b.split(" "), d = 0;
    if (d = -1 < a.indexOf("bold")) {
      a.splice(d - 1, 1), this.setFontBold(!0);
    }
    if (d = -1 < a.indexOf("italic")) {
      a.splice(d - 1, 1), this.setFontItalic(!0);
    }
    d = parseInt(a.shift());
    this.setFontSize(d);
    this.setFontType(a.join(" "));
    this.font = this.getFont();
    this.textObject.font = b;
    Entry.stage.update();
    this.setWidth(this.textObject.getMeasuredWidth());
    this.updateBG();
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.setLineHeight = function() {
  switch(this.getFontType()) {
    case "Nanum Gothic Coding":
      this.textObject.lineHeight = this.fontSize;
      break;
    default:
      this.textObject.lineHeight = 0;
  }
};
Entry.EntityObject.prototype.syncFont = function() {
  this.textObject.font = this.getFont();
  this.setLineHeight();
  Entry.stage.update();
  this.getLineBreak() || this.setWidth(this.textObject.getMeasuredWidth());
  Entry.stage.updateObject();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getFontType = function() {
  return this.fontType;
};
Entry.EntityObject.prototype.setFontType = function(b) {
  "textBox" == this.parent.objectType && (this.fontType = b ? b : "Nanum Gothic", this.syncFont());
};
Entry.EntityObject.prototype.getFontSize = function(b) {
  return this.fontSize;
};
Entry.EntityObject.prototype.setFontSize = function(b) {
  "textBox" == this.parent.objectType && this.fontSize != b && (this.fontSize = b ? b : 20, this.syncFont(), this.alignTextBox());
};
Entry.EntityObject.prototype.setFontBold = function(b) {
  this.fontBold = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontBold = function() {
  this.fontBold = !this.fontBold;
  this.syncFont();
  return this.fontBold;
};
Entry.EntityObject.prototype.setFontItalic = function(b) {
  this.fontItalic = b;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontItalic = function() {
  this.fontItalic = !this.fontItalic;
  this.syncFont();
  return this.fontItalic;
};
Entry.EntityObject.prototype.setFontName = function(b) {
  for (var a = this.font.split(" "), d = [], c = 0, e = a.length;c < e;c++) {
    ("bold" === a[c] || "italic" === a[c] || -1 < a[c].indexOf("px")) && d.push(a[c]);
  }
  this.setFont(d.join(" ") + " " + b);
};
Entry.EntityObject.prototype.getFontName = function() {
  if ("textBox" == this.type) {
    if (!this.font) {
      return "";
    }
    for (var b = this.font.split(" "), a = [], d = 0, c = b.length;d < c;d++) {
      "bold" !== b[d] && "italic" !== b[d] && -1 === b[d].indexOf("px") && a.push(b[d]);
    }
    return a.join(" ").trim();
  }
};
Entry.EntityObject.prototype.setText = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = ""), this.text = b, this.textObject.text = this.text, this.lineBreak || (this.setWidth(this.textObject.getMeasuredWidth()), this.parent.updateCoordinateView()), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getText = function() {
  return this.text;
};
Entry.EntityObject.prototype.setTextAlign = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = Entry.TEXT_ALIGN_CENTER), this.textAlign = b, this.textObject.textAlign = Entry.TEXT_ALIGNS[this.textAlign], this.alignTextBox(), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getTextAlign = function() {
  return this.textAlign;
};
Entry.EntityObject.prototype.setLineBreak = function(b) {
  if ("textBox" == this.parent.objectType) {
    void 0 === b && (b = !1);
    var a = this.lineBreak;
    this.lineBreak = b;
    a && !this.lineBreak ? (this.textObject.lineWidth = null, this.setHeight(this.textObject.getMeasuredLineHeight()), this.setText(this.getText().replace(/\n/g, ""))) : !a && this.lineBreak && (this.setFontSize(this.getFontSize() * this.getScaleX()), this.setHeight(3 * this.textObject.getMeasuredLineHeight()), this.setWidth(this.getWidth() * this.getScaleX()), this.setScaleX(1), this.setScaleY(1), this.textObject.lineWidth = this.getWidth(), this.alignTextBox());
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.getLineBreak = function() {
  return this.lineBreak;
};
Entry.EntityObject.prototype.setVisible = function(b) {
  void 0 === b && (b = !0);
  this.visible = b;
  this.object.visible = this.visible;
  this.dialog && this.syncDialogVisible();
  Entry.requestUpdate = !0;
  return this.visible;
};
Entry.EntityObject.prototype.getVisible = function() {
  return this.visible;
};
Entry.EntityObject.prototype.setImage = function(b) {
  var a = this;
  delete b._id;
  Entry.assert("sprite" == this.type, "Set image is only for sprite object");
  b.id || (b.id = Entry.generateHash());
  this.picture = b;
  var d = this.picture.dimension, c = this.getRegX() - this.getWidth() / 2, e = this.getRegY() - this.getHeight() / 2;
  this.setWidth(d.width);
  this.setHeight(d.height);
  d.scaleX || (d.scaleX = this.getScaleX(), d.scaleY = this.getScaleY());
  this.setScaleX(this.scaleX);
  this.setScaleY(this.scaleY);
  this.setRegX(this.width / 2 + c);
  this.setRegY(this.height / 2 + e);
  var f = b.id + this.id, g = Entry.container.getCachedPicture(f);
  g ? (Entry.image = g, this.object.image = g, this.object.cache(0, 0, this.getWidth(), this.getHeight())) : (g = new Image, b.fileurl ? g.src = b.fileurl : (b = b.filename, g.src = Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/image/" + b + ".png"), this.object.image = g, this.object.cache(0, 0, this.getWidth(), this.getHeight()), g.onload = function(b) {
    Entry.container.cachePicture(f, g);
    Entry.image = g;
    a.object.image = g;
    a.object.cache(0, 0, a.getWidth(), a.getHeight());
    Entry.requestUpdate = !0;
  });
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.applyFilter = function(b) {
  function a(a, b) {
    for (var d in a) {
      if (a[d] !== b[d]) {
        return !1;
      }
    }
    return !0;
  }
  var d = this.effect, c = this.object;
  if (b || !a(d, this.getInitialEffectValue())) {
    (function(a, b) {
      var d = [], c = Entry.adjustValueWithMaxMin;
      a.brightness = a.brightness;
      var k = new createjs.ColorMatrix;
      k.adjustColor(c(a.brightness, -100, 100), 0, 0, 0);
      k = new createjs.ColorMatrixFilter(k);
      d.push(k);
      a.hue = a.hue.mod(360);
      k = new createjs.ColorMatrix;
      k.adjustColor(0, 0, 0, a.hue);
      k = new createjs.ColorMatrixFilter(k);
      d.push(k);
      var k = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], l = 10.8 * a.hsv * Math.PI / 180, m = Math.cos(l), l = Math.sin(l), n = Math.abs(a.hsv / 100);
      1 < n && (n -= Math.floor(n));
      0 < n && .33 >= n ? k = [1, 0, 0, 0, 0, 0, m, l, 0, 0, 0, -1 * l, m, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .66 >= n ? k = [m, 0, l, 0, 0, 0, 1, 0, 0, 0, l, 0, m, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .99 >= n && (k = [m, l, 0, 0, 0, -1 * l, m, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
      k = (new createjs.ColorMatrix).concat(k);
      k = new createjs.ColorMatrixFilter(k);
      d.push(k);
      b.alpha = a.alpha = c(a.alpha, 0, 1);
      b.filters = d;
    })(d, c), c.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0;
  }
};
Entry.EntityObject.prototype.resetFilter = function() {
  "sprite" == this.parent.objectType && (this.object.filters = [], this.setInitialEffectValue(), this.object.alpha = this.effect.alpha, this.object.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.updateDialog = function() {
  this.dialog && this.dialog.update();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
  this.collision = Entry.Utils.COLLISION.NONE;
};
Entry.EntityObject.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  "sprite" == this.parent.objectType && this.setImage(this.parent.getPicture());
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.removeClone = function() {
  if (this.isClone) {
    this.dialog && this.dialog.remove();
    this.brush && this.removeBrush();
    Entry.stage.unloadEntity(this);
    var b = this.parent.clonedEntities.indexOf(this);
    this.parent.clonedEntities.splice(b, 1);
    Entry.Utils.isFunction(this.clearExecutor) && this.clearExecutor();
  }
};
Entry.EntityObject.prototype.clearExecutor = function() {
  this.parent.script.clearExecutorsByEntity(this);
};
Entry.EntityObject.prototype.toJSON = function() {
  var b = {};
  b.x = Entry.cutDecimal(this.getX());
  b.y = Entry.cutDecimal(this.getY());
  b.regX = Entry.cutDecimal(this.getRegX());
  b.regY = Entry.cutDecimal(this.getRegY());
  b.scaleX = this.getScaleX();
  b.scaleY = this.getScaleY();
  b.rotation = Entry.cutDecimal(this.getRotation());
  b.direction = Entry.cutDecimal(this.getDirection());
  b.width = Entry.cutDecimal(this.getWidth());
  b.height = Entry.cutDecimal(this.getHeight());
  b.font = this.getFont();
  b.visible = this.getVisible();
  "textBox" == this.parent.objectType && (b.colour = this.getColour(), b.text = this.getText(), b.textAlign = this.getTextAlign(), b.lineBreak = this.getLineBreak(), b.bgColor = this.getBGColour(), b.underLine = this.getUnderLine(), b.strike = this.getStrike(), b.fontSize = this.getFontSize());
  return b;
};
Entry.EntityObject.prototype.setInitialEffectValue = function() {
  this.effect = this.getInitialEffectValue();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getInitialEffectValue = function() {
  return {blur:0, hue:0, hsv:0, brightness:0, contrast:0, saturation:0, alpha:1};
};
Entry.EntityObject.prototype.removeBrush = function() {
  Entry.stage.selectedObjectContainer.removeChild(this.shape);
  this.shape = this.brush = null;
};
Entry.EntityObject.prototype.updateBG = function() {
  if (this.bgObject) {
    this.bgObject.graphics.clear();
    var b = this.getWidth(), a = this.getHeight();
    this.bgObject.graphics.setStrokeStyle(1).beginStroke().beginFill(this.getBGColour()).drawRect(-b / 2, -a / 2, b, a);
    if (this.getLineBreak()) {
      this.bgObject.x = 0;
    } else {
      switch(this.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          this.bgObject.x = b / 2;
          break;
        case Entry.TEXT_ALIGN_CENTER:
          this.bgObject.x = 0;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          this.bgObject.x = -b / 2;
      }
    }
  }
};
Entry.EntityObject.prototype.alignTextBox = function() {
  if ("textBox" == this.type) {
    var b = this.textObject;
    if (this.lineBreak) {
      var a = b.getMeasuredLineHeight();
      b.y = a / 2 - this.getHeight() / 2;
      switch(this.textAlign) {
        case Entry.TEXT_ALIGN_CENTER:
          b.x = 0;
          break;
        case Entry.TEXT_ALIGN_LEFT:
          b.x = -this.getWidth() / 2;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          b.x = this.getWidth() / 2;
      }
      b.maxHeight = this.getHeight();
    } else {
      b.x = 0, b.y = 0;
    }
  }
};
Entry.EntityObject.prototype.syncDialogVisible = function() {
  this.dialog && (this.dialog.object.visible = this.visible);
};
Entry.Extension = function() {
};
(function(b) {
  b.renderView = function() {
  };
  b.toggleInformation = function() {
  };
})(Entry.Extension.prototype);
Entry.Helper = function() {
  this.visible = !1;
};
p = Entry.Helper.prototype;
p.generateView = function(b, a) {
  if (!this.parentView_) {
    this.parentView_ = b;
    this.blockHelpData = EntryStatic.blockInfo;
    var d = Entry.createElement("div", "entryBlockHelperWorkspace");
    this.view = d;
    Entry.isForLecture && d.addClass("lecture");
    this.parentView_.appendChild(d);
    var c = Entry.createElement("div", "entryBlockHelperContentWorkspace");
    c.addClass("entryBlockHelperIntro");
    Entry.isForLecture && c.addClass("lecture");
    d.appendChild(c);
    this.blockHelperContent_ = c;
    this.blockHelperView_ = d;
    d = Entry.createElement("div", "entryBlockHelperBlockWorkspace");
    this.blockHelperContent_.appendChild(d);
    c = Entry.createElement("div", "entryBlockHelperDescriptionWorkspace");
    this.blockHelperContent_.appendChild(c);
    c.innerHTML = Lang.Helper.Block_click_msg;
    this.blockHelperDescription_ = c;
    this._renderView = new Entry.RenderView($(d), "LEFT");
    this.code = new Entry.Code([]);
    this._renderView.changeCode(this.code);
    this.first = !0;
  }
};
p.bindWorkspace = function(b) {
  b && (this._blockViewObserver && this._blockViewObserver.destroy(), this.workspace = b, this._blockViewObserver = b.observe(this, "_updateSelectedBlock", ["selectedBlockView"]));
};
p._updateSelectedBlock = function() {
  var b = this.workspace.selectedBlockView;
  if (b && this.visible && b != this._blockView) {
    var a = b.block.type;
    this._blockView = b;
    this.renderBlock(a);
  }
};
p.renderBlock = function(b) {
  var a = Lang.Helper[b];
  if (b && this.visible && a && !Entry.block[b].isPrimitive) {
    this.first && (this.blockHelperContent_.removeClass("entryBlockHelperIntro"), this.first = !1);
    this.code.clear();
    var d = Entry.block[b].def, d = d || {type:b};
    this.code.createThread([d]);
    this.code.board.align();
    this.code.board.resize();
    var d = this.code.getThreads()[0].getFirstBlock().view, c = d.svgGroup.getBBox();
    b = c.width;
    c = c.height;
    d = d.getSkeleton().box(d).offsetX;
    isNaN(d) && (d = 0);
    this.blockHelperDescription_.innerHTML = a;
    this._renderView.align();
    $(this.blockHelperDescription_).css({top:c + 30});
    this._renderView.svgDom.css({"margin-left":-(b / 2) - 20 - d});
  }
};
p.getView = function() {
  return this.view;
};
p.resize = function() {
};
Entry.Activity = function(b, a) {
  this.name = b;
  this.timestamp = new Date;
  var d = [];
  if (void 0 !== a) {
    for (var c = 0, e = a.length;c < e;c++) {
      var f = a[c];
      d.push({key:f[0], value:f[1]});
    }
  }
  this.data = d;
};
Entry.ActivityReporter = function() {
  this._activities = [];
};
(function(b) {
  b.add = function(a) {
    if (a && 0 !== a.length) {
      if (!(a instanceof Entry.Activity)) {
        var b = a.shift();
        a = new Entry.Activity(b, a);
      }
      this._activities.push(a);
    }
  };
  b.clear = function() {
    this._activities = [];
  };
  b.get = function() {
    return this._activities;
  };
  b.report = function() {
  };
})(Entry.ActivityReporter.prototype);
Entry.State = function(b, a, d, c) {
  this.caller = a;
  this.func = d;
  3 < arguments.length && (this.params = Array.prototype.slice.call(arguments).slice(3));
  this.message = b;
  this.time = Entry.getUpTime();
  this.isPass = Entry.Command[b] ? Entry.Command[b].isPass : !1;
};
Entry.State.prototype.generateMessage = function() {
};
Entry.StateManager = function() {
  this.undoStack_ = [];
  this.redoStack_ = [];
  this.isIgnore = this.isRestore = !1;
  Entry.addEventListener("cancelLastCommand", function(b) {
    Entry.stateManager.cancelLastCommand();
  });
  Entry.addEventListener("run", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("stop", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.stateManager.addStamp();
  });
  Entry.addEventListener("undo", function(b) {
    Entry.stateManager.undo();
  });
  Entry.addEventListener("redo", function(b) {
    Entry.stateManager.redo();
  });
};
Entry.StateManager.prototype.generateView = function(b, a) {
};
Entry.StateManager.prototype.addCommand = function(b, a, d, c) {
  if (!this.isIgnoring()) {
    if (this.isRestoring()) {
      var e = new Entry.State, f = Array.prototype.slice.call(arguments);
      Entry.State.prototype.constructor.apply(e, f);
      this.redoStack_.push(e);
      Entry.reporter && Entry.reporter.report(e);
    } else {
      e = new Entry.State, f = Array.prototype.slice.call(arguments), Entry.State.prototype.constructor.apply(e, f), this.undoStack_.push(e), Entry.reporter && Entry.reporter.report(e), this.updateView();
    }
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.cancelLastCommand = function() {
  this.canUndo() && (this.undoStack_.pop(), this.updateView(), Entry.creationChangedEvent && Entry.creationChangedEvent.notify());
};
Entry.StateManager.prototype.getLastCommand = function() {
  return this.undoStack_[this.undoStack_.length - 1];
};
Entry.StateManager.prototype.undo = function() {
  if (this.canUndo() && !this.isRestoring()) {
    this.addActivity("undo");
    for (this.startRestore();this.undoStack_.length;) {
      var b = this.undoStack_.pop();
      b.func.apply(b.caller, b.params);
      if (!0 !== b.isPass) {
        break;
      }
    }
    this.updateView();
    this.endRestore();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.redo = function() {
  if (this.canRedo() && !this.isRestoring()) {
    for (this.addActivity("redo");this.redoStack_.length;) {
      var b = this.redoStack_.pop();
      b.func.apply(b.caller, b.params);
      if (!0 !== b.isPass) {
        break;
      }
    }
    this.updateView();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.updateView = function() {
  this.undoButton && this.redoButton && (this.canUndo() ? this.undoButton.addClass("active") : this.undoButton.removeClass("active"), this.canRedo() ? this.redoButton.addClass("active") : this.redoButton.removeClass("active"));
};
Entry.StateManager.prototype.startRestore = function() {
  this.isRestore = !0;
};
Entry.StateManager.prototype.endRestore = function() {
  this.isRestore = !1;
};
Entry.StateManager.prototype.isRestoring = function() {
  return this.isRestore;
};
Entry.StateManager.prototype.startIgnore = function() {
  this.isIgnore = !0;
};
Entry.StateManager.prototype.endIgnore = function() {
  this.isIgnore = !1;
};
Entry.StateManager.prototype.isIgnoring = function() {
  return this.isIgnore;
};
Entry.StateManager.prototype.canUndo = function() {
  return 0 < this.undoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.canRedo = function() {
  return 0 < this.redoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.addStamp = function() {
  this.stamp = Entry.generateHash();
  this.undoStack_.length && (this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp);
};
Entry.StateManager.prototype.isSaved = function() {
  return 0 === this.undoStack_.length || this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp && "string" == typeof this.stamp;
};
Entry.StateManager.prototype.addActivity = function(b) {
  Entry.reporter && Entry.reporter.report(new Entry.State(b));
};
Entry.EntryObject = function(b) {
  var a = this;
  if (b) {
    this.id = b.id;
    this.name = b.name || b.sprite.name;
    this.text = b.text || this.name;
    this.objectType = b.objectType;
    this.objectType || (this.objectType = "sprite");
    this.script = new Entry.Code(b.script ? b.script : [], this);
    this.pictures = b.sprite.pictures;
    this.sounds = [];
    this.sounds = b.sprite.sounds;
    for (var d = 0;d < this.sounds.length;d++) {
      this.sounds[d].id || (this.sounds[d].id = Entry.generateHash()), Entry.initSound(this.sounds[d]);
    }
    this.lock = b.lock ? b.lock : !1;
    this.isEditing = !1;
    "sprite" == this.objectType && (this.selectedPicture = b.selectedPictureId ? this.getPicture(b.selectedPictureId) : this.pictures[0]);
    this.scene = Entry.scene.getSceneById(b.scene) || Entry.scene.selectedScene;
    this.setRotateMethod(b.rotateMethod);
    this.entity = new Entry.EntityObject(this);
    this.entity.injectModel(this.selectedPicture ? this.selectedPicture : null, b.entity ? b.entity : this.initEntity(b));
    this.clonedEntities = [];
    Entry.stage.loadObject(this);
    for (d in this.pictures) {
      (function(b) {
        b.objectId = this.id;
        b.id || (b.id = Entry.generateHash());
        var d = new Image;
        if (b.fileurl) {
          d.src = b.fileurl;
        } else {
          if (b.fileurl) {
            d.src = b.fileurl;
          } else {
            var f = b.filename;
            d.src = Entry.defaultPath + "/uploads/" + f.substring(0, 2) + "/" + f.substring(2, 4) + "/image/" + f + ".png";
          }
        }
        Entry.Loader.addQueue();
        d.onload = function(d) {
          Entry.container.cachePicture(b.id + a.entity.id, this);
          Entry.requestUpdate = !0;
          Entry.Loader.removeQueue();
        };
        d.onerror = function(a) {
          Entry.Loader.removeQueue();
        };
      })(this.pictures[d]);
    }
  }
};
Entry.EntryObject.prototype.generateView = function() {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("li", this.id);
    b.addClass("entryContainerListElementWorkspace");
    b.object = this;
    Entry.Utils.disableContextmenu(b);
    var a = this;
    longPressTimer = null;
    $(b).bind("mousedown touchstart", function(b) {
      function d(a) {
        a.stopPropagation();
        h && 5 < Math.sqrt(Math.pow(a.pageX - h.x, 2) + Math.pow(a.pageY - h.y, 2)) && longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
      }
      function c(a) {
        a.stopPropagation();
        e.unbind(".object");
        longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
      }
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
      var e = $(document), f = b.type, g = !1;
      if (Entry.Utils.isRightButton(b)) {
        b.stopPropagation(), Entry.documentMousedown.notify(b), g = !0, a._rightClick(b);
      } else {
        var h = {x:b.clientX, y:b.clientY};
        "touchstart" !== f || g || (b.stopPropagation(), Entry.documentMousedown.notify(b), longPressTimer = setTimeout(function() {
          longPressTimer && (longPressTimer = null, a._rightClick(b));
        }, 1E3), e.bind("mousemove.object touchmove.object", d), e.bind("mouseup.object touchend.object", c));
      }
    });
    this.view_ = b;
    var d = this, b = Entry.createElement("ul");
    b.addClass("objectInfoView");
    Entry.objectEditable || b.addClass("entryHide");
    var c = Entry.createElement("li");
    c.addClass("objectInfo_visible");
    this.entity.getVisible() || c.addClass("objectInfo_unvisible");
    c.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = d.entity, a.setVisible(!a.getVisible()) ? this.removeClass("objectInfo_unvisible") : this.addClass("objectInfo_unvisible"));
    });
    var e = Entry.createElement("li");
    e.addClass("objectInfo_unlock");
    this.getLock() && e.addClass("objectInfo_lock");
    e.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = d, a.setLock(!a.getLock()) ? this.addClass("objectInfo_lock") : this.removeClass("objectInfo_lock"), a.updateInputViews(a.getLock()));
    });
    b.appendChild(c);
    b.appendChild(e);
    this.view_.appendChild(b);
    b = Entry.createElement("div");
    b.addClass("entryObjectThumbnailWorkspace");
    this.view_.appendChild(b);
    this.thumbnailView_ = b;
    b = Entry.createElement("div");
    b.addClass("entryObjectWrapperWorkspace");
    this.view_.appendChild(b);
    c = Entry.createElement("input");
    c.bindOnClick(function(a) {
      a.preventDefault();
      Entry.container.selectObject(d.id);
      this.readOnly || (this.focus(), this.select());
    });
    c.addClass("entryObjectNameWorkspace");
    b.appendChild(c);
    this.nameView_ = c;
    this.nameView_.entryObject = this;
    c.setAttribute("readonly", !0);
    var f = this;
    this.nameView_.onblur = function(a) {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    };
    this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && f.editObjectValues(!1);
    };
    this.nameView_.value = this.name;
    c = Entry.createElement("div");
    c.addClass("entryObjectEditWorkspace");
    c.object = this;
    this.editView_ = c;
    this.view_.appendChild(c);
    $(c).mousedown(function(b) {
      var d = a.isEditing;
      b.stopPropagation();
      Entry.documentMousedown.notify(b);
      Entry.engine.isState("run") || !1 !== d || (a.editObjectValues(!d), Entry.playground.object !== a && Entry.container.selectObject(a.id), a.nameView_.select());
    });
    c.blur = function(b) {
      a.editObjectComplete();
    };
    Entry.objectEditable && Entry.objectDeletable && (c = Entry.createElement("div"), c.addClass("entryObjectDeleteWorkspace"), c.object = this, this.deleteView_ = c, this.view_.appendChild(c), c.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    }));
    c = Entry.createElement("div");
    c.addClass("entryObjectInformationWorkspace");
    c.object = this;
    this.isInformationToggle = !1;
    b.appendChild(c);
    this.informationView_ = c;
    b = Entry.createElement("div");
    b.addClass("entryObjectRotationWrapperWorkspace");
    b.object = this;
    this.view_.appendChild(b);
    c = Entry.createElement("span");
    c.addClass("entryObjectCoordinateWorkspace");
    b.appendChild(c);
    e = Entry.createElement("span");
    e.addClass("entryObjectCoordinateSpanWorkspace");
    e.innerHTML = "X:";
    var g = Entry.createElement("input");
    g.addClass("entryObjectCoordinateInputWorkspace");
    g.setAttribute("readonly", !0);
    g.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    var h = Entry.createElement("span");
    h.addClass("entryObjectCoordinateSpanWorkspace");
    h.innerHTML = "Y:";
    var k = Entry.createElement("input");
    k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right");
    k.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    k.setAttribute("readonly", !0);
    var l = Entry.createElement("span");
    l.addClass("entryObjectCoordinateSizeWorkspace");
    l.innerHTML = Lang.Workspace.Size + " : ";
    var m = Entry.createElement("input");
    m.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size");
    m.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    m.setAttribute("readonly", !0);
    c.appendChild(e);
    c.appendChild(g);
    c.appendChild(h);
    c.appendChild(k);
    c.appendChild(l);
    c.appendChild(m);
    c.xInput_ = g;
    c.yInput_ = k;
    c.sizeInput_ = m;
    this.coordinateView_ = c;
    d = this;
    g.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    g.onblur = function(a) {
      isNaN(g.value) || d.entity.setX(Number(g.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    k.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    k.onblur = function(a) {
      isNaN(k.value) || d.entity.setY(Number(k.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    m.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    m.onblur = function(a) {
      isNaN(m.value) || d.entity.setSize(Number(m.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    c = Entry.createElement("div");
    c.addClass("entryObjectRotateLabelWrapperWorkspace");
    this.view_.appendChild(c);
    this.rotateLabelWrapperView_ = c;
    e = Entry.createElement("span");
    e.addClass("entryObjectRotateSpanWorkspace");
    e.innerHTML = Lang.Workspace.rotation + " : ";
    var n = Entry.createElement("input");
    n.addClass("entryObjectRotateInputWorkspace");
    n.setAttribute("readonly", !0);
    n.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.rotateSpan_ = e;
    this.rotateInput_ = n;
    h = Entry.createElement("span");
    h.addClass("entryObjectDirectionSpanWorkspace");
    h.innerHTML = Lang.Workspace.direction + " : ";
    var q = Entry.createElement("input");
    q.addClass("entryObjectDirectionInputWorkspace");
    q.setAttribute("readonly", !0);
    q.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.directionInput_ = q;
    c.appendChild(e);
    c.appendChild(n);
    c.appendChild(h);
    c.appendChild(q);
    c.rotateInput_ = n;
    c.directionInput_ = q;
    d = this;
    n.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    n.onblur = function(a) {
      a = n.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || d.entity.setRotation(Number(a));
      d.updateRotationView();
      Entry.stage.updateObject();
    };
    q.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    q.onblur = function(a) {
      a = q.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || d.entity.setDirection(Number(a));
      d.updateRotationView();
      Entry.stage.updateObject();
    };
    c = Entry.createElement("div");
    c.addClass("rotationMethodWrapper");
    b.appendChild(c);
    this.rotationMethodWrapper_ = c;
    b = Entry.createElement("span");
    b.addClass("entryObjectRotateMethodLabelWorkspace");
    c.appendChild(b);
    b.innerHTML = Lang.Workspace.rotate_method + " : ";
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeAWorkspace");
    b.object = this;
    this.rotateModeAView_ = b;
    c.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("free"), this.object.setRotateMethod("free"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeBWorkspace");
    b.object = this;
    this.rotateModeBView_ = b;
    c.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("vertical"), this.object.setRotateMethod("vertical"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeCWorkspace");
    b.object = this;
    this.rotateModeCView_ = b;
    c.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("none"), this.object.setRotateMethod("none"));
    });
    this.updateThumbnailView();
    this.updateCoordinateView();
    this.updateRotateMethodView();
    this.updateInputViews();
    this.updateCoordinateView(!0);
    this.updateRotationView(!0);
    return this.view_;
  }
  if ("phone" == Entry.type) {
    return b = Entry.createElement("li", this.id), b.addClass("entryContainerListElementWorkspace"), b.object = this, b.bindOnClick(function(a) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    }), $ && (a = this, context.attach("#" + this.id, [{text:Lang.Workspace.context_rename, href:"/", action:function(a) {
      a.preventDefault();
    }}, {text:Lang.Workspace.context_duplicate, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.addCloneObject(a);
    }}, {text:Lang.Workspace.context_remove, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.removeObject(a);
    }}])), this.view_ = b, b = Entry.createElement("ul"), b.addClass("objectInfoView"), c = Entry.createElement("li"), c.addClass("objectInfo_visible"), e = Entry.createElement("li"), e.addClass("objectInfo_lock"), b.appendChild(c), b.appendChild(e), this.view_.appendChild(b), b = Entry.createElement("div"), b.addClass("entryObjectThumbnailWorkspace"), this.view_.appendChild(b), this.thumbnailView_ = b, b = Entry.createElement("div"), b.addClass("entryObjectWrapperWorkspace"), this.view_.appendChild(b), 
    c = Entry.createElement("input"), c.addClass("entryObjectNameWorkspace"), b.appendChild(c), this.nameView_ = c, this.nameView_.entryObject = this, this.nameView_.onblur = function() {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    }, this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    }, this.nameView_.value = this.name, Entry.objectEditable && Entry.objectDeletable && (c = Entry.createElement("div"), c.addClass("entryObjectDeletePhone"), c.object = this, this.deleteView_ = c, this.view_.appendChild(c), c.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    })), c = Entry.createElement("button"), c.addClass("entryObjectEditPhone"), c.object = this, c.bindOnClick(function(a) {
      if (a = Entry.container.getObject(this.id)) {
        Entry.container.selectObject(a.id), Entry.playground.injectObject(a);
      }
    }), this.view_.appendChild(c), c = Entry.createElement("div"), c.addClass("entryObjectInformationWorkspace"), c.object = this, this.isInformationToggle = !1, b.appendChild(c), this.informationView_ = c, c = Entry.createElement("div"), c.addClass("entryObjectRotateLabelWrapperWorkspace"), this.view_.appendChild(c), this.rotateLabelWrapperView_ = c, e = Entry.createElement("span"), e.addClass("entryObjectRotateSpanWorkspace"), e.innerHTML = Lang.Workspace.rotation + " : ", n = Entry.createElement("input"), 
    n.addClass("entryObjectRotateInputWorkspace"), this.rotateSpan_ = e, this.rotateInput_ = n, h = Entry.createElement("span"), h.addClass("entryObjectDirectionSpanWorkspace"), h.innerHTML = Lang.Workspace.direction + " : ", q = Entry.createElement("input"), q.addClass("entryObjectDirectionInputWorkspace"), this.directionInput_ = q, c.appendChild(e), c.appendChild(n), c.appendChild(h), c.appendChild(q), c.rotateInput_ = n, c.directionInput_ = q, d = this, n.onkeypress = function(a) {
      13 == a.keyCode && (a = n.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || d.entity.setRotation(Number(a)), d.updateRotationView(), n.blur());
    }, n.onblur = function(a) {
      d.entity.setRotation(d.entity.getRotation());
      Entry.stage.updateObject();
    }, q.onkeypress = function(a) {
      13 == a.keyCode && (a = q.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || d.entity.setDirection(Number(a)), d.updateRotationView(), q.blur());
    }, q.onblur = function(a) {
      d.entity.setDirection(d.entity.getDirection());
      Entry.stage.updateObject();
    }, b = Entry.createElement("div"), b.addClass("entryObjectRotationWrapperWorkspace"), b.object = this, this.view_.appendChild(b), c = Entry.createElement("span"), c.addClass("entryObjectCoordinateWorkspace"), b.appendChild(c), e = Entry.createElement("span"), e.addClass("entryObjectCoordinateSpanWorkspace"), e.innerHTML = "X:", g = Entry.createElement("input"), g.addClass("entryObjectCoordinateInputWorkspace"), h = Entry.createElement("span"), h.addClass("entryObjectCoordinateSpanWorkspace"), 
    h.innerHTML = "Y:", k = Entry.createElement("input"), k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right"), l = Entry.createElement("span"), l.addClass("entryObjectCoordinateSpanWorkspace"), l.innerHTML = Lang.Workspace.Size, m = Entry.createElement("input"), m.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size"), c.appendChild(e), c.appendChild(g), c.appendChild(h), c.appendChild(k), c.appendChild(l), c.appendChild(m), 
    c.xInput_ = g, c.yInput_ = k, c.sizeInput_ = m, this.coordinateView_ = c, d = this, g.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(g.value) || d.entity.setX(Number(g.value)), d.updateCoordinateView(), d.blur());
    }, g.onblur = function(a) {
      d.entity.setX(d.entity.getX());
      Entry.stage.updateObject();
    }, k.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(k.value) || d.entity.setY(Number(k.value)), d.updateCoordinateView(), d.blur());
    }, k.onblur = function(a) {
      d.entity.setY(d.entity.getY());
      Entry.stage.updateObject();
    }, c = Entry.createElement("div"), c.addClass("rotationMethodWrapper"), b.appendChild(c), this.rotationMethodWrapper_ = c, b = Entry.createElement("span"), b.addClass("entryObjectRotateMethodLabelWorkspace"), c.appendChild(b), b.innerHTML = Lang.Workspace.rotate_method + " : ", b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeAWorkspace"), b.object = this, this.rotateModeAView_ = b, c.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("free");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeBWorkspace"), b.object = this, this.rotateModeBView_ = b, c.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("vertical");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeCWorkspace"), b.object = this, this.rotateModeCView_ = b, c.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("none");
    }), this.updateThumbnailView(), this.updateCoordinateView(), this.updateRotateMethodView(), this.updateInputViews(), this.view_;
  }
};
Entry.EntryObject.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "object name must be string");
  this.name = b;
  this.nameView_.value = b;
};
Entry.EntryObject.prototype.setText = function(b) {
  Entry.assert("string" == typeof b, "object text must be string");
  this.text = b;
};
Entry.EntryObject.prototype.setScript = function(b) {
  this.script = b;
};
Entry.EntryObject.prototype.getScriptText = function() {
  return JSON.stringify(this.script.toJSON());
};
Entry.EntryObject.prototype.initEntity = function(b) {
  var a = {};
  a.x = a.y = 0;
  a.rotation = 0;
  a.direction = 90;
  if ("sprite" == this.objectType) {
    var d = b.sprite.pictures[0].dimension;
    a.regX = d.width / 2;
    a.regY = d.height / 2;
    a.scaleX = a.scaleY = "background" == b.sprite.category.main || "new" == b.sprite.category.main ? Math.max(270 / d.height, 480 / d.width) : "new" == b.sprite.category.main ? 1 : 200 / (d.width + d.height);
    a.width = d.width;
    a.height = d.height;
  } else {
    if ("textBox" == this.objectType) {
      if (a.regX = 25, a.regY = 12, a.scaleX = a.scaleY = 1.5, a.width = 50, a.height = 24, a.text = b.text, b.options) {
        if (b = b.options, d = "", b.bold && (d += "bold "), b.italic && (d += "italic "), a.underline = b.underline, a.strike = b.strike, a.font = d + "20px " + b.font.family, a.colour = b.colour, a.bgColor = b.background, a.lineBreak = b.lineBreak) {
          a.width = 256, a.height = .5625 * a.width, a.regX = a.width / 2, a.regY = a.height / 2;
        }
      } else {
        a.underline = !1, a.strike = !1, a.font = "20px Nanum Gothic", a.colour = "#000000", a.bgColor = "#ffffff";
      }
    }
  }
  return a;
};
Entry.EntryObject.prototype.updateThumbnailView = function() {
  if ("sprite" == this.objectType) {
    if (this.entity.picture.fileurl) {
      this.thumbnailView_.style.backgroundImage = 'url("' + this.entity.picture.fileurl + '")';
    } else {
      var b = this.entity.picture.filename;
      this.thumbnailView_.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/thumb/" + b + '.png")';
    }
  } else {
    "textBox" == this.objectType && (this.thumbnailView_.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/text_icon.png") + ")");
  }
};
Entry.EntryObject.prototype.updateCoordinateView = function(b) {
  if ((this.isSelected() || b) && this.coordinateView_ && this.coordinateView_.xInput_ && this.coordinateView_.yInput_) {
    b = this.coordinateView_.xInput_.value;
    var a = this.coordinateView_.yInput_.value, d = this.coordinateView_.sizeInput_.value, c = this.entity.getX().toFixed(1), e = this.entity.getY().toFixed(1), f = this.entity.getSize().toFixed(1);
    b != c && (this.coordinateView_.xInput_.value = c);
    a != e && (this.coordinateView_.yInput_.value = e);
    d != f && (this.coordinateView_.sizeInput_.value = f);
  }
};
Entry.EntryObject.prototype.updateRotationView = function(b) {
  if (this.isSelected() && this.view_ || b) {
    b = "", "free" == this.getRotateMethod() ? (this.rotateSpan_.removeClass("entryRemove"), this.rotateInput_.removeClass("entryRemove"), b += this.entity.getRotation().toFixed(1), this.rotateInput_.value = b + "\u02da") : (this.rotateSpan_.addClass("entryRemove"), this.rotateInput_.addClass("entryRemove")), b = "" + this.entity.getDirection().toFixed(1), b += "\u02da", this.directionInput_.value = b;
  }
};
Entry.EntryObject.prototype.select = function(b) {
  console.log(this);
};
Entry.EntryObject.prototype.addPicture = function(b, a) {
  Entry.stateManager && Entry.stateManager.addCommand("add sprite", this, this.removePicture, b.id);
  b.objectId = this.id;
  a || 0 === a ? (this.pictures.splice(a, 0, b), Entry.playground.injectPicture(this)) : this.pictures.push(b);
  return new Entry.State(this, this.removePicture, b.id);
};
Entry.EntryObject.prototype.removePicture = function(b) {
  if (2 > this.pictures.length) {
    return !1;
  }
  b = this.getPicture(b);
  var a = this.pictures.indexOf(b);
  Entry.stateManager && Entry.stateManager.addCommand("remove sprite", this, this.addPicture, b, a);
  this.pictures.splice(a, 1);
  b === this.selectedPicture && Entry.playground.selectPicture(this.pictures[0]);
  Entry.playground.injectPicture(this);
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addPicture, b, a);
};
Entry.EntryObject.prototype.getPicture = function(b) {
  if (!b) {
    return this.selectedPicture;
  }
  b = b.trim();
  for (var a = this.pictures, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[c];
    }
  }
  for (c = 0;c < d;c++) {
    if (a[c].name == b) {
      return a[c];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && d >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.setPicture = function(b) {
  for (var a in this.pictures) {
    if (b.id === this.pictures[a].id) {
      this.pictures[a] = b;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.getPrevPicture = function(b) {
  for (var a = this.pictures, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[0 == c ? d - 1 : c - 1];
    }
  }
};
Entry.EntryObject.prototype.getNextPicture = function(b) {
  for (var a = this.pictures, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[c == d - 1 ? 0 : c + 1];
    }
  }
};
Entry.EntryObject.prototype.selectPicture = function(b) {
  var a = this.getPicture(b);
  if (a) {
    this.selectedPicture = a, this.entity.setImage(a), this.updateThumbnailView();
  } else {
    throw Error("No picture with pictureId : " + b);
  }
};
Entry.EntryObject.prototype.addSound = function(b, a) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add sound", this, this.removeSound, b.id);
  Entry.initSound(b, a);
  a || 0 === a ? (this.sounds.splice(a, 0, b), Entry.playground.injectSound(this)) : this.sounds.push(b);
  return new Entry.State(this, this.removeSound, b.id);
};
Entry.EntryObject.prototype.removeSound = function(b) {
  var a;
  a = this.getSound(b);
  b = this.sounds.indexOf(a);
  Entry.stateManager && Entry.stateManager.addCommand("remove sound", this, this.addSound, a, b);
  this.sounds.splice(b, 1);
  Entry.playground.reloadPlayground();
  Entry.playground.injectSound(this);
  return new Entry.State(this, this.addSound, a, b);
};
Entry.EntryObject.prototype.getRotateMethod = function() {
  this.rotateMethod || (this.rotateMethod = "free");
  return this.rotateMethod;
};
Entry.EntryObject.prototype.setRotateMethod = function(b) {
  b || (b = "free");
  this.rotateMethod = b;
  this.updateRotateMethodView();
  Entry.stage.selectedObject && Entry.stage.selectedObject.entity && (Entry.stage.updateObject(), Entry.stage.updateHandle());
};
Entry.EntryObject.prototype.initRotateValue = function(b) {
  this.rotateMethod != b && (b = this.entity, b.rotation = 0, b.direction = 90, b.flip = !1);
};
Entry.EntryObject.prototype.updateRotateMethodView = function() {
  var b = this.rotateMethod;
  this.rotateModeAView_ && (this.rotateModeAView_.removeClass("selected"), this.rotateModeBView_.removeClass("selected"), this.rotateModeCView_.removeClass("selected"), "free" == b ? this.rotateModeAView_.addClass("selected") : "vertical" == b ? this.rotateModeBView_.addClass("selected") : this.rotateModeCView_.addClass("selected"), this.updateRotationView());
};
Entry.EntryObject.prototype.toggleInformation = function(b) {
  this.setRotateMethod(this.getRotateMethod());
  void 0 === b && (b = this.isInformationToggle = !this.isInformationToggle);
  b ? this.view_.addClass("informationToggle") : this.view_.removeClass("informationToggle");
};
Entry.EntryObject.prototype.addCloneEntity = function(b, a, d) {
  this.clonedEntities.length > Entry.maxCloneLimit || (b = new Entry.EntityObject(this), a ? (b.injectModel(a.picture ? a.picture : null, a.toJSON()), b.snapshot_ = a.snapshot_, a.effect && (b.effect = Entry.cloneSimpleObject(a.effect), b.applyFilter()), a.brush && Entry.setCloneBrush(b, a.brush)) : (b.injectModel(this.entity.picture ? this.entity.picture : null, this.entity.toJSON(b)), b.snapshot_ = this.entity.snapshot_, this.entity.effect && (b.effect = Entry.cloneSimpleObject(this.entity.effect), 
  b.applyFilter()), this.entity.brush && Entry.setCloneBrush(b, this.entity.brush)), Entry.engine.raiseEventOnEntity(b, [b, "when_clone_start"]), b.isClone = !0, b.isStarted = !0, this.addCloneVariables(this, b, a ? a.variables : null, a ? a.lists : null), this.clonedEntities.push(b), Entry.stage.loadEntity(b));
};
Entry.EntryObject.prototype.initializeSplitter = function(b) {
  b.onmousedown = function(a) {
    Entry.container.disableSort();
    Entry.container.splitterEnable = !0;
  };
  document.addEventListener("mousemove", function(a) {
    Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.x || a.clientX});
  });
  document.addEventListener("mouseup", function(a) {
    Entry.container.splitterEnable = !1;
    Entry.container.enableSort();
  });
};
Entry.EntryObject.prototype.isSelected = function() {
  return this.isSelected_;
};
Entry.EntryObject.prototype.toJSON = function() {
  var b = {};
  b.id = this.id;
  b.name = this.name;
  "textBox" == this.objectType && (b.text = this.text);
  b.script = this.getScriptText();
  "sprite" == this.objectType && (b.selectedPictureId = this.selectedPicture.id);
  b.objectType = this.objectType;
  b.rotateMethod = this.getRotateMethod();
  b.scene = this.scene.id;
  b.sprite = {pictures:Entry.getPicturesJSON(this.pictures), sounds:Entry.getSoundsJSON(this.sounds)};
  b.lock = this.lock;
  b.entity = this.entity.toJSON();
  return b;
};
Entry.EntryObject.prototype.destroy = function() {
  Entry.stage.unloadEntity(this.entity);
  this.view_ && Entry.removeElement(this.view_);
};
Entry.EntryObject.prototype.getSound = function(b) {
  b = b.trim();
  for (var a = this.sounds, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[c];
    }
  }
  for (c = 0;c < d;c++) {
    if (a[c].name == b) {
      return a[c];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && d >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No Sound");
};
Entry.EntryObject.prototype.addCloneVariables = function(b, a, d, c) {
  a.variables = [];
  a.lists = [];
  d || (d = Entry.findObjsByKey(Entry.variableContainer.variables_, "object_", b.id));
  c || (c = Entry.findObjsByKey(Entry.variableContainer.lists_, "object_", b.id));
  for (b = 0;b < d.length;b++) {
    a.variables.push(d[b].clone());
  }
  for (b = 0;b < c.length;b++) {
    a.lists.push(c[b].clone());
  }
};
Entry.EntryObject.prototype.getLock = function() {
  return this.lock;
};
Entry.EntryObject.prototype.setLock = function(b) {
  this.lock = b;
  Entry.stage.updateObject();
  return b;
};
Entry.EntryObject.prototype.updateInputViews = function(b) {
  b = b || this.getLock();
  var a = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b && 1 != a[0].getAttribute("readonly")) {
    for (b = 0;b < a.length;b++) {
      a[b].removeClass("selectedEditingObject"), a[b].setAttribute("readonly", !1), this.isEditing = !1;
    }
  }
};
Entry.EntryObject.prototype.editObjectValues = function(b) {
  var a;
  a = this.getLock() ? [this.nameView_] : [this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b) {
    var d = this.nameView_;
    $(a).removeClass("selectedNotEditingObject");
    $(d).removeClass("selectedNotEditingObject");
    window.setTimeout(function() {
      $(d).removeAttr("readonly");
      d.addClass("selectedEditingObject");
    });
    for (b = 0;b < a.length;b++) {
      $(a[b]).removeAttr("readonly"), a[b].addClass("selectedEditingObject");
    }
    this.isEditing = !0;
  } else {
    for (b = 0;b < a.length;b++) {
      a[b].blur(!0);
    }
    this.nameView_.blur(!0);
    this.blurAllInput();
    this.isEditing = !1;
  }
};
Entry.EntryObject.prototype.blurAllInput = function() {
  var b = document.getElementsByClassName("selectedEditingObject");
  $(b).removeClass("selectedEditingObject");
  for (var b = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_], a = 0;a < b.length;a++) {
    b[a].addClass("selectedNotEditingObject"), b[a].setAttribute("readonly", !0);
  }
};
Entry.EntryObject.prototype.addStampEntity = function(b) {
  b = new Entry.StampEntity(this, b);
  Entry.stage.loadEntity(b);
  this.clonedEntities.push(b);
  Entry.stage.sortZorder();
};
Entry.EntryObject.prototype.getClonedEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp || b.push(a);
  });
  return b;
};
Entry.EntryObject.prototype.getStampEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp && b.push(a);
  });
  return b;
};
Entry.EntryObject.prototype.clearExecutor = function() {
  this.script.clearExecutors();
  for (var b = this.clonedEntities.length;0 < b;b--) {
    this.clonedEntities[b - 1].removeClone();
  }
  this.clonedEntities = [];
};
Entry.EntryObject.prototype._rightClick = function(b) {
  var a = this, d = [{text:Lang.Workspace.context_rename, callback:function(b) {
    b.stopPropagation();
    a.setLock(!1);
    a.editObjectValues(!0);
    a.nameView_.select();
  }}, {text:Lang.Workspace.context_duplicate, enable:!Entry.engine.isState("run"), callback:function() {
    Entry.container.addCloneObject(a);
  }}, {text:Lang.Workspace.context_remove, callback:function() {
    Entry.container.removeObject(a);
  }}, {text:Lang.Workspace.copy_file, callback:function() {
    Entry.container.setCopiedObject(a);
  }}, {text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
    Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
  }}];
  b = Entry.Utils.convertMouseEvent(b);
  Entry.ContextMenu.show(d, "workspace-contextmenu", {x:b.clientX, y:b.clientY});
};
Entry.Painter = function() {
  this.toolbox = {selected:"cursor"};
  this.stroke = {enabled:!1, fillColor:"#000000", lineColor:"#000000", thickness:1, fill:!0, transparent:!1, style:"line", locked:!1};
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  this.font = {name:"KoPub Batang", size:20, style:"normal"};
  this.selectArea = {};
  this.firstStatement = !1;
};
Entry.Painter.prototype.initialize = function(b) {
  this.generateView(b);
  this.canvas = document.getElementById("entryPainterCanvas");
  this.canvas_ = document.getElementById("entryPainterCanvas_");
  this.stage = new createjs.Stage(this.canvas);
  this.stage.autoClear = !0;
  this.stage.enableDOMEvents(!0);
  this.stage.enableMouseOver(10);
  this.stage.mouseMoveOutside = !0;
  createjs.Touch.enable(this.stage);
  this.objectContainer = new createjs.Container;
  this.objectContainer.name = "container";
  this.stage.addChild(this.objectContainer);
  this.ctx = this.stage.canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = !1;
  this.ctx.webkitImageSmoothingEnabled = !1;
  this.ctx.mozImageSmoothingEnabled = !1;
  this.ctx.msImageSmoothingEnabled = !1;
  this.ctx.oImageSmoothingEnabled = !1;
  this.ctx_ = this.canvas_.getContext("2d");
  this.initDashedLine();
  this.initPicture();
  this.initCoordinator();
  this.initHandle();
  this.initDraw();
  var a = this;
  Entry.addEventListener("textUpdate", function() {
    var b = a.inputField.value();
    "" === b ? (a.inputField.hide(), delete a.inputField) : (a.inputField.hide(), a.drawText(b), a.selectToolbox("cursor"));
  });
  this.selectToolbox("cursor");
};
Entry.Painter.prototype.initHandle = function() {
  this._handle = new createjs.Container;
  this._handle.rect = new createjs.Shape;
  this._handle.addChild(this._handle.rect);
  var b = new createjs.Container;
  b.name = "move";
  b.width = 90;
  b.height = 90;
  b.x = 90;
  b.y = 90;
  b.rect = new createjs.Shape;
  var a = this;
  b.rect.on("mousedown", function(d) {
    "cursor" === a.toolbox.selected && (a.initCommand(), this.offset = {x:this.parent.x - this.x - d.stageX, y:this.parent.y - this.y - d.stageY}, this.parent.handleMode = "move", b.isSelectCenter = !1);
  });
  b.rect.on("pressmove", function(d) {
    "cursor" !== a.toolbox.selected || b.isSelectCenter || (a.doCommand(), this.parent.x = d.stageX + this.offset.x, this.parent.y = d.stageY + this.offset.y, a.updateImageHandle());
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.rect.cursor = "move";
  b.addChild(b.rect);
  b.notch = new createjs.Shape;
  b.addChild(b.notch);
  b.NEHandle = this.generateCornerHandle();
  b.addChild(b.NEHandle);
  b.NWHandle = this.generateCornerHandle();
  b.addChild(b.NWHandle);
  b.SWHandle = this.generateCornerHandle();
  b.addChild(b.SWHandle);
  b.SEHandle = this.generateCornerHandle();
  b.addChild(b.SEHandle);
  b.EHandle = this.generateXHandle();
  b.addChild(b.EHandle);
  b.WHandle = this.generateXHandle();
  b.addChild(b.WHandle);
  b.NHandle = this.generateYHandle();
  b.addChild(b.NHandle);
  b.SHandle = this.generateYHandle();
  b.addChild(b.SHandle);
  b.RHandle = new createjs.Shape;
  b.RHandle.graphics.ss(2, 2, 0).beginFill("#888").s("#c1c7cd").f("#c1c7cd").dr(-2, -2, 8, 8);
  b.RHandle.on("mousedown", function(b) {
    a.initCommand();
  });
  b.RHandle.on("pressmove", function(b) {
    a.doCommand();
    var c = b.stageX - this.parent.x;
    b = b.stageY - this.parent.y;
    this.parent.rotation = 0 <= c ? Math.atan(b / c) / Math.PI * 180 + 90 : Math.atan(b / c) / Math.PI * 180 + 270;
    a.updateImageHandle();
  });
  b.RHandle.cursor = "crosshair";
  b.addChild(b.RHandle);
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.visible = !1;
  this.handle = b;
  this.stage.addChild(b);
  this.updateImageHandleCursor();
};
Entry.Painter.prototype.generateCornerHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var c = Math.sqrt(Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x * (a.stageY - this.parent.y + this.parent.regY) / this.offset.y));
    10 < this.parent.width * c && 10 < this.parent.height * c && (this.parent.width *= c, this.parent.height *= c, this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateXHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var c = Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x);
    10 < this.parent.width * c && (this.parent.width *= c, this.offset = {x:a.stageX - this.parent.x + this.parent.regX});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateYHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var c = Math.abs((a.stageY - this.parent.y + this.parent.regY) / this.offset.y);
    10 < this.parent.height * c && (this.parent.height *= c, this.offset = {y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.updateImageHandle = function() {
  if (this.handle.visible) {
    var b = this.handle, a = b.direction, d = b.width, c = b.height, e = b.regX, f = b.regY;
    b.rect.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(-d / 2, -c / 2).lt(0, -c / 2).lt(0, -c / 2).lt(+d / 2, -c / 2).lt(+d / 2, +c / 2).lt(-d / 2, +c / 2).cp();
    b.notch.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(0, -c / 2).lt(0, -c / 2 - 20).cp();
    b.NEHandle.x = +b.width / 2;
    b.NEHandle.y = -b.height / 2;
    b.NWHandle.x = -b.width / 2;
    b.NWHandle.y = -b.height / 2;
    b.SWHandle.x = -b.width / 2;
    b.SWHandle.y = +b.height / 2;
    b.SEHandle.x = +b.width / 2;
    b.SEHandle.y = +b.height / 2;
    b.EHandle.x = +b.width / 2;
    b.EHandle.y = 0;
    b.WHandle.x = -b.width / 2;
    b.WHandle.y = 0;
    b.NHandle.x = 0;
    b.NHandle.y = -b.height / 2;
    b.SHandle.x = 0;
    b.SHandle.y = +b.height / 2;
    b.RHandle.x = -2;
    b.RHandle.y = -b.height / 2 - 20 - 2;
    this.handle.visible && (d = this.selectedObject, this.selectedObject.text ? (d.width = this.selectedObject.width, d.height = this.selectedObject.height) : (d.width = d.image.width, d.height = d.image.height), d.scaleX = b.width / d.width, d.scaleY = b.height / d.height, d.x = b.x, d.y = b.y, d.regX = d.width / 2 + e / d.scaleX, d.regY = d.height / 2 + f / d.scaleY, d.rotation = b.rotation, d.direction = a, this.selectArea.x1 = b.x - b.width / 2, this.selectArea.y1 = b.y - b.height / 2, this.selectArea.x2 = 
    b.width, this.selectArea.y2 = b.height, this.objectWidthInput.value = Math.abs(d.width * d.scaleX).toFixed(0), this.objectHeightInput.value = Math.abs(d.height * d.scaleY).toFixed(0), this.objectRotateInput.value = (1 * d.rotation).toFixed(0));
    this.updateImageHandleCursor();
    this.stage.update();
  }
};
Entry.Painter.prototype.updateImageHandleCursor = function() {
  var b = this.handle;
  b.rect.cursor = "move";
  b.RHandle.cursor = "crosshair";
  for (var a = ["nwse-resize", "ns-resize", "nesw-resize", "ew-resize"], d = Math.floor((b.rotation + 22.5) % 180 / 45), c = 0;c < d;c++) {
    a.push(a.shift());
  }
  b.NHandle.cursor = a[1];
  b.NEHandle.cursor = a[2];
  b.EHandle.cursor = a[3];
  b.SEHandle.cursor = a[0];
  b.SHandle.cursor = a[1];
  b.SWHandle.cursor = a[2];
  b.WHandle.cursor = a[3];
  b.NWHandle.cursor = a[0];
};
Entry.Painter.prototype.clearCanvas = function(b) {
  this.clearHandle();
  b || this.initCommand();
  this.objectContainer.removeAllChildren();
  this.stage.update();
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  b = 0;
  for (var a = this.colorLayerData.data.length;b < a;b++) {
    this.colorLayerData.data[b] = 255, this.colorLayerData.data[b + 1] = 255, this.colorLayerData.data[b + 2] = 255, this.colorLayerData.data[b + 3] = 255;
  }
  this.reloadContext();
};
Entry.Painter.prototype.newPicture = function() {
  var b = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
  b.id = Entry.generateHash();
  Entry.playground.addPicture(b, !0);
};
Entry.Painter.prototype.initPicture = function() {
  var b = this;
  Entry.addEventListener("pictureSelected", function(a) {
    b.selectToolbox("cursor");
    if (b.file.id !== a.id) {
      b.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && (b.file_ = JSON.parse(JSON.stringify(b.file)), b.file_save(!0));
      b.file.modified = !1;
      b.clearCanvas(!0);
      var d = new Image;
      d.id = a.id ? a.id : Entry.generateHash();
      b.file.id = d.id;
      b.file.name = a.name;
      b.file.mode = "edit";
      d.src = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/image/" + a.filename + ".png";
      d.onload = function(a) {
        b.addImage(a.target);
      };
    }
  });
  Entry.addEventListener("pictureImport", function(a) {
    b.addPicture(a);
  });
  Entry.addEventListener("pictureNameChanged", function(a) {
    b.file.name = a.name;
  });
  Entry.addEventListener("pictureClear", function(a) {
    b.file.modified = !1;
    b.file.id = "";
    b.file.name = "";
    b.clearCanvas();
  });
};
Entry.Painter.prototype.initDraw = function() {
  var b = this;
  this.stage.on("stagemousedown", function(a) {
    b.stagemousedown(a);
  });
  this.stage.on("stagemouseup", function(a) {
    b.stagemouseup(a);
  });
  this.stage.on("stagemousemove", function(a) {
    b.stagemousemove(a);
  });
};
Entry.Painter.prototype.selectObject = function(b, a) {
  this.selectedObject = b;
  this.handle.visible = b.visible;
  a ? (this.handle.width = this.copy.width, this.handle.height = this.copy.height, this.handle.x = this.selectArea.x1 + this.copy.width / 2, this.handle.y = this.selectArea.y1 + this.copy.height / 2) : (this.handle.width = b.scaleX * b.image.width, this.handle.height = b.scaleY * b.image.height, this.handle.x = b.x, this.handle.y = b.y, this.handle.regX = +(b.regX - b.image.width / 2) * b.scaleX, this.handle.regY = +(b.regY - b.image.height / 2) * b.scaleY);
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.selectTextObject = function(b) {
  this.selectedObject = b;
  var a = b.getTransformedBounds();
  this.handle.visible = b.visible;
  b.width || (this.selectedObject.width = a.width);
  b.height || (this.selectedObject.height = a.height);
  this.handle.width = b.scaleX * this.selectedObject.width;
  this.handle.height = b.scaleY * this.selectedObject.height;
  this.handle.x = b.x;
  this.handle.y = b.y;
  b.regX || (b.regX = b.width / 2);
  b.regY || (b.regY = b.height / 2);
  this.handle.regX = (b.regX - this.selectedObject.width / 2) * b.scaleX;
  this.handle.regY = (b.regY - this.selectedObject.height / 2) * b.scaleY;
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.updateHandle = function() {
  -1 < this.stage.getChildIndex(this._handle) && this.stage.removeChild(this._handle);
  -1 === this.stage.getChildIndex(this.handle) && this.stage.addChild(this.handle);
  var b = new createjs.Shape;
  b.graphics.clear().beginFill("#000").rect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.handle.rect.hitArea = b;
  this.handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#000000").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 4);
  this.stage.update();
};
Entry.Painter.prototype.updateHandle_ = function() {
  this.stage.getChildIndex(-1 < this._handle) && this.stage.addChild(this._handle);
  this._handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#cccccc").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 2);
  this.stage.update();
};
Entry.Painter.prototype.matchTolerance = function(b, a, d, c, e) {
  var f = this.colorLayerData.data[b], g = this.colorLayerData.data[b + 1];
  b = this.colorLayerData.data[b + 2];
  return f >= a - e / 100 * a && f <= a + e / 100 * a && g >= d - e / 100 * d && g <= d + e / 100 * d && b >= c - e / 100 * c && b <= c + e / 100 * c;
};
Entry.Painter.prototype.matchColorOnly = function(b, a, d, c) {
  return a === this.colorLayerData.data[b] && d === this.colorLayerData.data[b + 1] && c === this.colorLayerData.data[b + 2] ? !0 : !1;
};
Entry.Painter.prototype.matchColor = function(b, a, d, c, e) {
  return a === this.colorLayerData.data[b] && d === this.colorLayerData.data[b + 1] && c === this.colorLayerData.data[b + 2] && e === this.colorLayerData.data[b + 3] ? !0 : !1;
};
Entry.Painter.prototype.colorPixel = function(b, a, d, c, e) {
  e || (e = 255);
  this.stroke.transparent && (e = c = d = a = 0);
  this.colorLayerData.data[b] = a;
  this.colorLayerData.data[b + 1] = d;
  this.colorLayerData.data[b + 2] = c;
  this.colorLayerData.data[b + 3] = e;
};
Entry.Painter.prototype.pickStrokeColor = function(b) {
  b = 4 * (Math.round(b.stageY) * this.canvas.width + Math.round(b.stageX));
  this.stroke.lineColor = Entry.rgb2hex(this.colorLayerData.data[b], this.colorLayerData.data[b + 1], this.colorLayerData.data[b + 2]);
  document.getElementById("entryPainterAttrCircle").style.backgroundColor = this.stroke.lineColor;
  document.getElementById("entryPainterAttrCircleInput").value = this.stroke.lineColor;
};
Entry.Painter.prototype.drawText = function(b) {
  var a = document.getElementById("entryPainterAttrFontStyle").value, d = document.getElementById("entryPainterAttrFontName").value, c = document.getElementById("entryPainterAttrFontSize").value;
  b = new createjs.Text(b, a + " " + c + 'px "' + d + '"', this.stroke.lineColor);
  b.textBaseline = "top";
  b.x = this.oldPt.x;
  b.y = this.oldPt.y;
  this.objectContainer.addChild(b);
  this.selectTextObject(b);
  this.file.modified = !0;
};
Entry.Painter.prototype.addImage = function(b) {
  var a = new createjs.Bitmap(b);
  this.objectContainer.addChild(a);
  a.x = this.stage.canvas.width / 2;
  a.y = this.stage.canvas.height / 2;
  a.regX = a.image.width / 2 | 0;
  a.regY = a.image.height / 2 | 0;
  if (540 < a.image.height) {
    var d = 540 / a.image.height;
    a.scaleX = d;
    a.scaleY = d;
  }
  a.name = b.id;
  a.id = b.id;
  this.selectObject(a);
  this.stage.update();
};
Entry.Painter.prototype.createBrush = function() {
  this.initCommand();
  this.brush = new createjs.Shape;
  this.objectContainer.addChild(this.brush);
  this.stage.update();
};
Entry.Painter.prototype.createEraser = function() {
  this.initCommand();
  this.eraser = new createjs.Shape;
  this.objectContainer.addChild(this.eraser);
  this.stage.update();
};
Entry.Painter.prototype.clearHandle = function() {
  this.handle.visible && (this.handle.visible = !1);
  this.coordinator.visible && (this.coordinator.visible = !1);
  this.stage.update();
};
Entry.Painter.prototype.initCommand = function() {
  var b = !1;
  this.handle.visible && (b = !0, this.handle.visible = !1);
  var a = !1;
  this.coordinator.visible && (a = !0, this.coordinator.visible = !1);
  (b || a) && this.stage.update();
  this.isCommandValid = !1;
  this.colorLayerModel = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  Entry.stateManager && this.firstStatement && Entry.stateManager.addCommand("edit sprite", this, this.restorePainter, this.colorLayerModel);
  this.firstStatement = !0;
  b && (this.handle.visible = !0);
  a && (this.coordinator.visible = !0);
  (b || a) && this.stage.update();
};
Entry.Painter.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.Painter.prototype.checkCommand = function() {
  this.isCommandValid || Entry.dispatchEvent("cancelLastCommand");
};
Entry.Painter.prototype.restorePainter = function(b) {
  this.clearHandle();
  var a = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(b, 0, 0);
  b = new Image;
  b.src = this.canvas.toDataURL();
  var d = this;
  b.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    d.objectContainer.removeAllChildren();
    d.objectContainer.addChild(a);
  };
  Entry.stateManager && Entry.stateManager.addCommand("restore sprite", this, this.restorePainter, a);
};
Entry.Painter.prototype.platten = function() {
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.reloadContext();
};
Entry.Painter.prototype.fill = function() {
  if (!this.stroke.locked) {
    this.stroke.locked = !0;
    this.initCommand();
    this.doCommand();
    this.clearHandle();
    var b = this.canvas.width, a = this.canvas.height;
    this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
    var d = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
    d.x = Math.round(d.x);
    d.y = Math.round(d.y);
    for (var c = 4 * (d.y * b + d.x), e = this.colorLayerData.data[c], f = this.colorLayerData.data[c + 1], g = this.colorLayerData.data[c + 2], h = this.colorLayerData.data[c + 3], k, l, d = [[d.x, d.y]], m = Entry.hex2rgb(this.stroke.lineColor);d.length;) {
      for (var c = d.pop(), n = c[0], q = c[1], c = 4 * (q * b + n);0 <= q && this.matchColor(c, e, f, g, h);) {
        --q, c -= 4 * b;
      }
      c += 4 * b;
      q += 1;
      for (l = k = !1;q < a - 1 && this.matchColor(c, e, f, g, h);) {
        q += 1, this.colorPixel(c, m.r, m.g, m.b), 0 < n && (this.matchColor(c - 4, e, f, g, h) ? k || (d.push([n - 1, q]), k = !0) : k && (k = !1)), n < b - 1 && (this.matchColor(c + 4, e, f, g, h) ? l || (d.push([n + 1, q]), l = !0) : l && (l = !1)), c += 4 * b;
      }
      if (1080 < d.length) {
        break;
      }
    }
    this.file.modified = !0;
    this.reloadContext();
  }
};
Entry.Painter.prototype.reloadContext = function() {
  delete this.selectedObject;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    a.stroke.locked = !1;
  };
};
Entry.Painter.prototype.move_pen = function() {
  var b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.brush.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke(this.stroke.lineColor).moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_line = function() {
  this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").moveTo(this.oldPt.x, this.oldPt.y).lineTo(this.stage.mouseX, this.stage.mouseY);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_rect = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, this.oldPt.y, b, a);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_circle = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().beginStroke(this.stroke.fillColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.stroke.fill || (0 === this.stroke.thickness ? this.brush.graphics.clear().drawEllipse(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawEllipse(this.oldPt.x, this.oldPt.y, b, a));
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.edit_copy = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0)) : alert("\ubcf5\uc0ac\ud560 \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_cut = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0), this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), this.reloadContext(), this.file.modified = !0) : alert("\uc790\ub97c \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_paste = function() {
  var b = new Image;
  b.src = this.canvas_.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    b.x = a.canvas.width / 2;
    b.y = a.canvas.height / 2;
    b.regX = a.copy.width / 2 | 0;
    b.regY = a.copy.height / 2 | 0;
    b.id = Entry.generateHash();
    a.objectContainer.addChild(b);
    a.selectObject(b, !0);
  };
  this.file.modified = !0;
};
Entry.Painter.prototype.edit_select = function() {
  this.clearHandle();
  this.selectedObject && delete this.selectedObject;
  this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.copy = {};
  this.copy.width = this.selectArea.x2;
  this.copy.height = this.selectArea.y2;
  this.canvas_.width = this.copy.width;
  this.canvas_.height = this.copy.height;
  this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ctx_.putImageData(this.copyLayerData, 0, 0);
  this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    b = new Image;
    b.src = a.canvas_.toDataURL();
    b.onload = function(b) {
      b = new createjs.Bitmap(b.target);
      b.x = a.selectArea.x1 + a.copy.width / 2;
      b.y = a.selectArea.y1 + a.copy.height / 2;
      b.regX = a.copy.width / 2 | 0;
      b.regY = a.copy.height / 2 | 0;
      b.id = Entry.generateHash();
      b.name = b.id;
      a.objectContainer.addChild(b);
      a.selectObject(b, !0);
    };
  };
};
Entry.Painter.prototype.move_erase = function(b) {
  b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.eraser.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke("#ffffff").moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.settingShapeBlur = function() {
  this.objectWidthInput.blur();
  this.objectHeightInput.blur();
  this.objectRotateInput.blur();
};
Entry.Painter.prototype.stagemousedown = function(b) {
  "picture" == Entry.playground.getViewMode() && (this.settingShapeBlur(), this.oldPt = new createjs.Point(b.stageX, b.stageY), this.oldMidPt = this.oldPt.clone(), "select" === this.toolbox.selected ? this.stage.addChild(this._handle) : "spoid" === this.toolbox.selected ? this.pickStrokeColor(b) : "text" === this.toolbox.selected ? (this.showInputField(b), this.stage.update()) : "erase" === this.toolbox.selected ? (this.createEraser(), this.stroke.enabled = !0) : "fill" === this.toolbox.selected ? 
  this.fill() : "cursor" !== this.toolbox.selected && (this.createBrush(), this.stroke.enabled = !0));
};
Entry.Painter.prototype.stagemousemove = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected && -1 < this.stage.getChildIndex(this._handle) ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.updateHandle_()) : this.stroke.enabled && (this.doCommand(), "pen" === this.toolbox.selected ? this.move_pen(b) : "line" === this.toolbox.selected ? this.move_line(b) : "rect" === this.toolbox.selected ? 
  this.move_rect(b) : "circle" === this.toolbox.selected ? this.move_circle(b) : "erase" === this.toolbox.selected && this.move_erase(b)), this.painterTopStageXY.innerHTML = "x:" + b.stageX.toFixed(1) + ", y:" + b.stageY.toFixed(1));
};
Entry.Painter.prototype.stagemouseup = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.stage.removeChild(this._handle), this.stage.update(), 0 < this.selectArea.x2 && 0 < this.selectArea.y2 && this.edit_select(), this.selectToolbox("cursor")) : "cursor" !== this.toolbox.selected && this.stroke.enabled && (-1 < this.objectContainer.getChildIndex(this.eraser) && 
  this.eraser.graphics.endStroke(), -1 < this.objectContainer.getChildIndex(this.brush) && this.brush.graphics.endStroke(), this.clearHandle(), this.platten(), this.stroke.enabled = !1, this.checkCommand()));
};
Entry.Painter.prototype.file_save = function(b) {
  this.clearHandle();
  this.transparent();
  this.trim();
  var a = this.canvas_.toDataURL();
  Entry.dispatchEvent("saveCanvasImage", {file:b ? this.file_ : this.file, image:a});
  this.file.modified = !1;
};
Entry.Painter.prototype.transparent = function() {
  var b = this.canvas.width, a = this.canvas.height;
  this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
  var d = b * (a - 1) * 4, c = 4 * (b - 1), e = 4 * (b * a - 1);
  this.matchColorOnly(0, 255, 255, 255) ? this.fillTransparent(1, 1) : this.matchColorOnly(d, 255, 255, 255) ? this.fillTransparent(1, a) : this.matchColorOnly(c, 255, 255, 255) ? this.fillTransparent(b, 1) : this.matchColorOnly(e, 255, 255, 255) && this.fillTransparent(b, a);
};
Entry.Painter.prototype.fillTransparent = function(b, a) {
  this.stage.mouseX = b;
  this.stage.mouseY = a;
  this.stroke.transparent = !0;
  this.fill();
};
Entry.Painter.prototype.trim = function() {
  var b = this.canvas.width, a = this.ctx.getImageData(0, 0, b, this.canvas.height), d = a.data.length, c, e = null, f = null, g = null, h = null, k;
  for (c = 0;c < d;c += 4) {
    0 !== a.data[c + 3] && (g = c / 4 % b, k = ~~(c / 4 / b), null === e && (e = k), null === f ? f = g : g < f && (f = g), null === h ? h = k : h < k && (h = k));
  }
  b = h - e;
  a = g - f;
  d = null;
  0 === b || 0 === a ? (d = this.ctx.getImageData(0, 0, 1, 1), d.data[0] = 255, d.data[1] = 255, d.data[2] = 255, d.data[3] = 255, this.canvas_.width = 1, this.canvas_.height = 1) : (d = this.ctx.getImageData(f, e, a, b), this.canvas_.width = a, this.canvas_.height = b);
  this.ctx_.putImageData(d, 0, 0);
};
Entry.Painter.prototype.showInputField = function(b) {
  this.inputField ? (Entry.dispatchEvent("textUpdate"), delete this.inputField) : (this.initCommand(), this.doCommand(), this.inputField = new CanvasInput({canvas:document.getElementById("entryPainterCanvas"), fontSize:20, fontFamily:this.font.name, fontColor:"#000", width:650, padding:8, borderWidth:1, borderColor:"#000", borderRadius:3, boxShadow:"1px 1px 0px #fff", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:b.stageX, y:b.stageY, onsubmit:function() {
    Entry.dispatchEvent("textUpdate");
  }}), this.inputField.show());
};
Entry.Painter.prototype.addPicture = function(b) {
  this.initCommand();
  var a = new Image;
  a.id = Entry.generateHash();
  a.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
  var d = this;
  a.onload = function(a) {
    d.addImage(a.target);
    d.selectToolbox("cursor");
  };
};
Entry.Painter.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "/workspace_coordinate.png");
  b.addChild(a);
  this.stage.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Painter.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  this.stage.update();
};
Entry.Painter.prototype.initDashedLine = function() {
  createjs.Graphics.prototype.dashedLineTo = function(b, a, d, c, e) {
    this.moveTo(b, a);
    var f = d - b, g = c - a;
    e = Math.floor(Math.sqrt(f * f + g * g) / e);
    for (var f = f / e, g = g / e, h = 0;h++ < e;) {
      b += f, a += g, this[0 === h % 2 ? "moveTo" : "lineTo"](b, a);
    }
    this[0 === h % 2 ? "moveTo" : "lineTo"](d, c);
    return this;
  };
  createjs.Graphics.prototype.drawDashedRect = function(b, a, d, c, e) {
    this.moveTo(b, a);
    d = b + d;
    c = a + c;
    this.dashedLineTo(b, a, d, a, e);
    this.dashedLineTo(d, a, d, c, e);
    this.dashedLineTo(d, c, b, c, e);
    this.dashedLineTo(b, c, b, a, e);
    return this;
  };
  createjs.Graphics.prototype.drawResizableDashedRect = function(b, a, d, c, e, f) {
    this.moveTo(b, a);
    d = b + d;
    c = a + c;
    this.dashedLineTo(b + f, a, d - f, a, e);
    this.dashedLineTo(d, a + f, d, c - f, e);
    this.dashedLineTo(d - f, c, b + f, c, e);
    this.dashedLineTo(b, c - f, b, a + f, e);
    return this;
  };
};
Entry.Painter.prototype.generateView = function(b) {
  var a = this;
  this.view_ = b;
  if (!Entry.type || "workspace" == Entry.type) {
    this.view_.addClass("entryPainterWorkspace");
    var d = Entry.createElement("div", "entryPainterTop");
    d.addClass("entryPlaygroundPainterTop");
    this.view_.appendChild(d);
    var c = Entry.createElement("div", "entryPainterToolbox");
    c.addClass("entryPlaygroundPainterToolbox");
    this.view_.appendChild(c);
    var e = Entry.createElement("div", "entryPainterToolboxTop");
    e.addClass("entryPainterToolboxTop");
    c.appendChild(e);
    var f = Entry.createElement("div", "entryPainterContainer");
    f.addClass("entryPlaygroundPainterContainer");
    this.view_.appendChild(f);
    e = Entry.createElement("canvas", "entryPainterCanvas");
    e.width = 960;
    e.height = 540;
    e.addClass("entryPlaygroundPainterCanvas");
    f.appendChild(e);
    e = Entry.createElement("canvas", "entryPainterCanvas_");
    e.addClass("entryRemove");
    e.width = 960;
    e.height = 540;
    f.appendChild(e);
    var g = Entry.createElement("div", "entryPainterAttr");
    g.addClass("entryPlaygroundPainterAttr");
    this.view_.appendChild(g);
    this.flipObject = Entry.createElement("div", "entryPictureFlip");
    this.flipObject.addClass("entryPlaygroundPainterFlip");
    g.appendChild(this.flipObject);
    e = Entry.createElement("div", "entryPictureFlipX");
    e.title = "\uc88c\uc6b0\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleX *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipX");
    this.flipObject.appendChild(e);
    e = Entry.createElement("div", "entryPictureFlipY");
    e.title = "\uc0c1\ud558\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleY *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipY");
    this.flipObject.appendChild(e);
    Entry.addEventListener("windowResized", function(a) {
      var d = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      a = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var c = parseInt(document.getElementById("entryCanvas").style.width), d = d - (c + 240), c = a - 349;
      b.style.width = d + "px";
      f.style.width = d - 54 + "px";
      f.style.height = c + "px";
      g.style.top = c + 30 + "px";
      g.style.height = a - c + "px";
    });
    var h = Entry.createElement("nav", "entryPainterTopMenu");
    h.addClass("entryPlaygroundPainterTopMenu");
    d.appendChild(h);
    e = Entry.createElement("ul");
    h.appendChild(e);
    var k = Entry.createElement("li");
    h.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuFileNew");
    h.bindOnClick(function() {
      a.newPicture();
    });
    h.addClass("entryPlaygroundPainterTopMenuFileNew");
    h.innerHTML = Lang.Workspace.new_picture;
    k.appendChild(h);
    h = Entry.createElement("li", "entryPainterTopMenuFile");
    h.addClass("entryPlaygroundPainterTopMenuFile");
    h.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(h);
    k = Entry.createElement("ul");
    h.appendChild(k);
    h = Entry.createElement("li");
    k.appendChild(h);
    var l = Entry.createElement("a", "entryPainterTopMenuFileSave");
    l.bindOnClick(function() {
      a.file_save(!1);
    });
    l.addClass("entryPainterTopMenuFileSave");
    l.innerHTML = Lang.Workspace.painter_file_save;
    h.appendChild(l);
    h = Entry.createElement("li");
    k.appendChild(h);
    k = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    k.bindOnClick(function() {
      a.file.mode = "new";
      a.file_save(!1);
    });
    k.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    k.innerHTML = Lang.Workspace.painter_file_saveas;
    h.appendChild(k);
    k = Entry.createElement("li", "entryPainterTopMenuEdit");
    k.addClass("entryPlaygroundPainterTopMenuEdit");
    k.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(k);
    e = Entry.createElement("ul");
    k.appendChild(e);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    h.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    h.addClass("entryPainterTopMenuEditImport");
    h.innerHTML = Lang.Workspace.get_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    h.bindOnClick(function() {
      a.edit_copy();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCopy");
    h.innerHTML = Lang.Workspace.copy_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCut");
    h.bindOnClick(function() {
      a.edit_cut();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCut");
    h.innerHTML = Lang.Workspace.cut_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    h.bindOnClick(function() {
      a.edit_paste();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditPaste");
    h.innerHTML = Lang.Workspace.paste_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      a.clearCanvas();
    });
    k.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    d.appendChild(e);
    e = Entry.createElement("ul", "entryPainterTopToolbar");
    e.addClass("entryPlaygroundPainterTopToolbar");
    d.appendChild(e);
    d = Entry.createElement("li", "entryPainterTopToolbarUndo");
    d.bindOnClick(function() {
    });
    d.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(d);
    d = Entry.createElement("li", "entryPainterTopToolbarRedo");
    d.bindOnClick(function() {
    });
    d.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(d);
    d = Entry.createElement("ul");
    d.addClass("entryPlaygroundPainterToolboxContainer");
    c.appendChild(d);
    this.toolboxCursor = Entry.createElement("li", "entryPainterToolboxCursor");
    this.toolboxCursor.title = "\uc774\ub3d9";
    this.toolboxCursor.bindOnClick(function() {
      a.selectToolbox("cursor");
    });
    this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
    d.appendChild(this.toolboxCursor);
    this.toolboxSelect = Entry.createElement("li", "entryPainterToolboxSelect");
    this.toolboxSelect.title = "\uc790\ub974\uae30";
    this.toolboxSelect.bindOnClick(function() {
      a.selectToolbox("select");
    });
    this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
    d.appendChild(this.toolboxSelect);
    this.toolboxPen = Entry.createElement("li", "entryPainterToolboxPen");
    this.toolboxPen.title = "\ud39c";
    this.toolboxPen.bindOnClick(function() {
      a.selectToolbox("pen");
    });
    this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
    d.appendChild(this.toolboxPen);
    this.toolboxLine = Entry.createElement("li", "entryPainterToolboxLine");
    this.toolboxLine.title = "\uc9c1\uc120";
    this.toolboxLine.bindOnClick(function() {
      a.selectToolbox("line");
    });
    this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
    d.appendChild(this.toolboxLine);
    this.toolboxRect = Entry.createElement("li", "entryPainterToolboxRect");
    this.toolboxRect.title = "\uc0ac\uac01\ud615";
    this.toolboxRect.bindOnClick(function() {
      a.selectToolbox("rect");
    });
    this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
    d.appendChild(this.toolboxRect);
    this.toolboxCircle = Entry.createElement("li", "entryPainterToolboxCircle");
    this.toolboxCircle.title = "\uc6d0";
    this.toolboxCircle.bindOnClick(function() {
      a.selectToolbox("circle");
    });
    this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
    d.appendChild(this.toolboxCircle);
    this.toolboxText = Entry.createElement("li", "entryPainterToolboxText");
    this.toolboxText.title = "\uae00\uc0c1\uc790";
    this.toolboxText.bindOnClick(function() {
      a.selectToolbox("text");
    });
    this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
    d.appendChild(this.toolboxText);
    this.toolboxFill = Entry.createElement("li", "entryPainterToolboxFill");
    this.toolboxFill.bindOnClick(function() {
      a.selectToolbox("fill");
    });
    this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
    d.appendChild(this.toolboxFill);
    this.toolboxErase = Entry.createElement("li", "entryPainterToolboxErase");
    this.toolboxErase.title = "\uc9c0\uc6b0\uae30";
    this.toolboxErase.bindOnClick(function() {
      a.selectToolbox("erase");
    });
    this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
    d.appendChild(this.toolboxErase);
    c = Entry.createElement("li", "entryPainterToolboxCoordinate");
    c.title = "\uc88c\ud45c";
    c.bindOnClick(function() {
      a.toggleCoordinator();
    });
    c.addClass("entryPlaygroundPainterToolboxCoordinate");
    d.appendChild(c);
    this.attrResizeArea = Entry.createElement("fieldset", "painterAttrResize");
    this.attrResizeArea.addClass("entryPlaygroundPainterAttrResize");
    g.appendChild(this.attrResizeArea);
    c = Entry.createElement("legend");
    c.innerHTML = Lang.Workspace.picture_size;
    this.attrResizeArea.appendChild(c);
    c = Entry.createElement("div", "painterAttrWrapper");
    c.addClass("painterAttrWrapper");
    this.attrResizeArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeX");
    c.appendChild(d);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrResizeXTop");
    e.innerHTML = "X";
    d.appendChild(e);
    this.objectWidthInput = Entry.createElement("input", "entryPainterAttrWidth");
    this.objectWidthInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.width = this.value;
      a.updateImageHandle();
    };
    this.objectWidthInput.addClass("entryPlaygroundPainterNumberInput");
    d.appendChild(this.objectWidthInput);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterSizeText");
    d.innerHTML = "x";
    c.appendChild(d);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundAttrReiszeY");
    c.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrResizeYTop");
    c.innerHTML = "Y";
    d.appendChild(c);
    this.objectHeightInput = Entry.createElement("input", "entryPainterAttrHeight");
    this.objectHeightInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.height = this.value;
      a.updateImageHandle();
    };
    this.objectHeightInput.addClass("entryPlaygroundPainterNumberInput");
    d.appendChild(this.objectHeightInput);
    this.attrRotateArea = Entry.createElement("div", "painterAttrRotateArea");
    this.attrRotateArea.addClass("painterAttrRotateArea");
    g.appendChild(this.attrRotateArea);
    c = Entry.createElement("div");
    c.addClass("painterAttrRotateName");
    c.innerHTML = Lang.Workspace.picture_rotation;
    this.attrRotateArea.appendChild(c);
    c = Entry.createElement("fieldset", "entryPainterAttrRotate");
    c.addClass("entryPlaygroundPainterAttrRotate");
    this.attrRotateArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("painterAttrRotateTop");
    d.innerHTML = "\u03bf";
    c.appendChild(d);
    this.objectRotateInput = Entry.createElement("input", "entryPainterAttrDegree");
    this.objectRotateInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      360 <= this.value ? this.value %= 360 : 0 > this.value && (this.value = 360 + this.value % 360);
      a.handle.rotation = this.value;
      a.updateImageHandle();
    };
    this.objectRotateInput.addClass("entryPlaygroundPainterNumberInput");
    this.objectRotateInput.defaultValue = "0";
    c.appendChild(this.objectRotateInput);
    this.attrColorArea = Entry.createElement("fieldset", "entryPainterAttrColor");
    this.attrColorArea.addClass("entryPlaygroundPainterAttrColor");
    g.appendChild(this.attrColorArea);
    var m = Entry.createElement("div");
    m.addClass("entryPlaygroundPainterAttrColorContainer");
    this.attrColorArea.appendChild(m);
    this.attrCircleArea = Entry.createElement("div");
    this.attrCircleArea.addClass("painterAttrCircleArea");
    g.appendChild(this.attrCircleArea);
    c = Entry.createElement("div", "entryPainterAttrCircle");
    c.addClass("painterAttrCircle");
    this.attrCircleArea.appendChild(c);
    this.attrCircleArea.painterAttrCircle = c;
    c = Entry.createElement("input", "entryPainterAttrCircleInput");
    c.value = "#000000";
    c.addClass("painterAttrCircleInput");
    this.attrCircleArea.appendChild(c);
    this.attrColorSpoid = Entry.createElement("div");
    this.attrColorSpoid.bindOnClick(function() {
      a.selectToolbox("spoid");
    });
    this.attrColorSpoid.addClass("painterAttrColorSpoid");
    g.appendChild(this.attrColorSpoid);
    Entry.getColourCodes().forEach(function(b) {
      var d = Entry.createElement("div");
      d.addClass("entryPlaygroundPainterAttrColorElement");
      "transparent" === b ? d.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/transparent.png") + ")" : d.style.backgroundColor = b;
      d.bindOnClick(function(d) {
        "transparent" === b ? (a.stroke.transparent = !0, a.stroke.lineColor = "#ffffff") : (a.stroke.transparent = !1, r && (document.getElementById("entryPainterShapeBackgroundColor").style.backgroundColor = b, a.stroke.fillColor = b), r || (document.getElementById("entryPainterShapeLineColor").style.backgroundColor = b, a.stroke.lineColor = b));
        document.getElementById("entryPainterAttrCircle").style.backgroundColor = a.stroke.lineColor;
        document.getElementById("entryPainterAttrCircleInput").value = b;
      });
      m.appendChild(d);
    });
    this.attrThickArea = Entry.createElement("div", "painterAttrThickArea");
    this.attrThickArea.addClass("entryPlaygroundentryPlaygroundPainterAttrThickArea");
    g.appendChild(this.attrThickArea);
    c = Entry.createElement("legend");
    c.addClass("painterAttrThickName");
    c.innerHTML = Lang.Workspace.thickness;
    this.attrThickArea.appendChild(c);
    var n = Entry.createElement("fieldset", "entryPainterAttrThick");
    n.addClass("entryPlaygroundPainterAttrThick");
    this.attrThickArea.appendChild(n);
    c = Entry.createElement("div");
    c.addClass("paintAttrThickTop");
    n.appendChild(c);
    e = Entry.createElement("select", "entryPainterAttrThick");
    e.addClass("entryPlaygroundPainterAttrThickInput");
    e.size = "1";
    e.onchange = function(b) {
      a.stroke.thickness = b.target.value;
    };
    for (c = 1;10 >= c;c++) {
      d = Entry.createElement("option"), d.value = c, d.innerHTML = c, e.appendChild(d);
    }
    n.appendChild(e);
    c = Entry.createElement("div", "entryPainterShapeLineColor");
    c.addClass("painterAttrShapeLineColor");
    d = Entry.createElement("div", "entryPainterShapeInnerBackground");
    d.addClass("painterAttrShapeInnerBackground");
    c.appendChild(d);
    n.appendChild(c);
    this.attrThickArea.painterAttrShapeLineColor = c;
    n.bindOnClick(function() {
      q.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !1;
    });
    this.attrBackgroundArea = Entry.createElement("div", "painterAttrBackgroundArea");
    this.attrBackgroundArea.addClass("entryPlaygroundPainterBackgroundArea");
    g.appendChild(this.attrBackgroundArea);
    c = Entry.createElement("fieldset", "entryPainterAttrbackground");
    c.addClass("entryPlaygroundPainterAttrBackground");
    this.attrBackgroundArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("paintAttrBackgroundTop");
    c.appendChild(d);
    var q = Entry.createElement("div", "entryPainterShapeBackgroundColor");
    q.addClass("painterAttrShapeBackgroundColor");
    this.attrBackgroundArea.painterAttrShapeBackgroundColor = q;
    d.appendChild(q);
    var r = !1;
    q.bindOnClick(function(a) {
      n.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !0;
    });
    this.attrFontArea = Entry.createElement("div", "painterAttrFont");
    this.attrFontArea.addClass("entryPlaygroundPainterAttrFont");
    g.appendChild(this.attrFontArea);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrTop");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPaintAttrTop_");
    e.appendChild(c);
    c = Entry.createElement("legend");
    c.addClass("panterAttrFontTitle");
    c.innerHTML = Lang.Workspace.textStyle;
    k = Entry.createElement("select", "entryPainterAttrFontName");
    k.addClass("entryPlaygroundPainterAttrFontName");
    k.size = "1";
    k.onchange = function(b) {
      a.font.name = b.target.value;
    };
    for (c = 0;c < Entry.fonts.length;c++) {
      h = Entry.fonts[c], d = Entry.createElement("option"), d.value = h.family, d.innerHTML = h.name, k.appendChild(d);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("painterAttrFontSizeArea");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("painterAttrFontSizeTop");
    e.appendChild(c);
    k = Entry.createElement("select", "entryPainterAttrFontSize");
    k.addClass("entryPlaygroundPainterAttrFontSize");
    k.size = "1";
    k.onchange = function(b) {
      a.font.size = b.target.value;
    };
    for (c = 20;72 >= c;c++) {
      d = Entry.createElement("option"), d.value = c, d.innerHTML = c, k.appendChild(d);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrFontStyleArea");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrFontTop");
    e.appendChild(c);
    k = Entry.createElement("select", "entryPainterAttrFontStyle");
    k.addClass("entryPlaygroundPainterAttrFontStyle");
    k.size = "1";
    k.onchange = function(b) {
      a.font.style = b.target.value;
    };
    h = [{label:"\ubcf4\ud1b5", value:"normal"}, {label:"\uad75\uac8c", value:"bold"}, {label:"\uae30\uc6b8\uc784", value:"italic"}];
    for (c = 0;c < h.length;c++) {
      l = h[c], d = Entry.createElement("option"), d.value = l.value, d.innerHTML = l.label, k.appendChild(d);
    }
    e.appendChild(k);
    this.attrLineArea = Entry.createElement("div", "painterAttrLineStyle");
    this.attrLineArea.addClass("entryPlaygroundPainterAttrLineStyle");
    g.appendChild(this.attrLineArea);
    var t = Entry.createElement("div");
    t.addClass("entryPlaygroundPainterAttrLineStyleLine");
    this.attrLineArea.appendChild(t);
    var u = Entry.createElement("div");
    u.addClass("entryPlaygroundPaitnerAttrLineArea");
    this.attrLineArea.appendChild(u);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrLineStyleLine1");
    u.appendChild(c);
    c.value = "line";
    var v = Entry.createElement("div");
    v.addClass("painterAttrLineStyleBackgroundLine");
    t.bindOnClick(function(a) {
      u.removeClass("entryRemove");
    });
    u.blur = function(a) {
      this.addClass("entryRemove");
    };
    u.onmouseleave = function(a) {
      this.addClass("entryRemove");
    };
    c.bindOnClick(function(a) {
      this.attrLineArea.removeClass(t);
      this.attrLineArea.appendChild(v);
      this.attrLineArea.onchange(a);
      u.blur();
    });
    v.bindOnClick(function(a) {
      u.removeClass("entryRemove");
    });
    this.attrLineArea.onchange = function(b) {
      a.stroke.style = b.target.value;
    };
    u.blur();
  }
};
Entry.Painter.prototype.restoreHandle = function() {
  this.selectedObject && !1 === this.handle.visible && (this.handle.visible = !0, this.stage.update());
};
Entry.Painter.prototype.initDisplay = function() {
  this.stroke.enabled = !1;
  this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
  this.toolboxCursor.removeClass("entryToolboxCursorClicked");
  this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
  this.toolboxSelect.removeClass("entryToolboxSelectClicked");
  this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
  this.toolboxPen.removeClass("entryToolboxPenClicked");
  this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
  this.toolboxLine.removeClass("entryToolboxLineClicked");
  this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
  this.toolboxRect.removeClass("entryToolboxRectClicked");
  this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
  this.toolboxCircle.removeClass("entryToolBoxCircleClicked");
  this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
  this.toolboxText.removeClass("entryToolBoxTextClicked");
  this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
  this.toolboxFill.removeClass("entryToolBoxFillClicked");
  this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
  this.toolboxErase.removeClass("entryToolBoxEraseClicked");
  this.attrColorSpoid.addClass("painterAttrColorSpoid");
  this.attrColorSpoid.removeClass("painterAttrColorSpoidClicked");
  this.attrResizeArea.addClass("entryRemove");
  this.attrRotateArea.addClass("entryRemove");
  this.attrThickArea.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrLineArea.addClass("entryRemove");
  this.attrColorArea.addClass("entryRemove");
  this.attrCircleArea.addClass("entryRemove");
  this.attrColorSpoid.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrBackgroundArea.addClass("entryRemove");
  this.flipObject.addClass("entryRemove");
  this.attrThickArea.painterAttrShapeLineColor.addClass("entryRemove");
  this.attrBackgroundArea.painterAttrShapeBackgroundColor.addClass("entryRemove");
  this.attrCircleArea.painterAttrCircle.addClass("entryRemove");
  this.inputField && !this.inputField._isHidden && (this.inputField.hide(), this.stage.update());
};
Entry.Painter.prototype.selectToolbox = function(b) {
  this.toolbox.selected = b;
  "erase" != b && $(".entryPlaygroundPainterContainer").removeClass("dd");
  this.initDisplay();
  "cursor" !== b && this.clearHandle();
  "text" !== b && this.inputField && delete this.inputField;
  switch(b) {
    case "cursor":
      this.restoreHandle();
      this.toolboxCursor.addClass("entryToolboxCursorClicked");
      this.attrResizeArea.removeClass("entryRemove");
      this.attrRotateArea.removeClass("entryRemove");
      this.flipObject.removeClass("entryRemove");
      break;
    case "select":
      this.toolboxSelect.addClass("entryToolboxSelectClicked");
      break;
    case "pen":
      this.toolboxPen.addClass("entryToolboxPenClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "line":
      this.toolboxLine.addClass("entryToolboxLineClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "rect":
      this.toolboxRect.addClass("entryToolboxRectClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "circle":
      this.toolboxCircle.addClass("entryToolBoxCircleClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "text":
      this.toolboxText.addClass("entryToolBoxTextClicked");
      this.attrFontArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "fill":
      this.toolboxFill.addClass("entryToolBoxFillClicked");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "erase":
      $(".entryPlaygroundPainterContainer").addClass("dd");
      this.toolboxErase.addClass("entryToolBoxEraseClicked");
      this.attrThickArea.removeClass("entryRemove");
      break;
    case "spoid":
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("painterAttrColorSpoid");
      this.attrColorSpoid.addClass("painterAttrColorSpoidClicked");
      break;
    case "coordinate":
      this.toggleCoordinator();
  }
};
Entry.Painter2 = function(b) {
  this.view = b;
  this.baseUrl = Entry.painterBaseUrl || "/lib/literallycanvas/lib/img";
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  Entry.addEventListener("pictureImport", function(a) {
    this.addPicture(a);
  }.bind(this));
  this.clipboard = null;
};
(function(b) {
  b.initialize = function() {
    if (!this.lc) {
      var a = this.baseUrl, b = new Image;
      b.src = a + "/transparent-pattern.png";
      this.lc = LC.init(this.view, {imageURLPrefix:a, zoomMax:3, zoomMin:.5, toolbarPosition:"bottom", imageSize:{width:960, height:540}, backgroundShapes:[LC.createShape("Rectangle", {x:0, y:0, width:960, height:540, strokeWidth:0, strokeColor:"transparent"})]});
      b.onload = function() {
        this.lc.repaintLayer("background");
      }.bind(this);
      a = function(a) {
        a.shape && !a.opts && a.shape.isPass || a.opts && a.opts.isPass ? Entry.do("processPicture", a, this.lc) : Entry.do("editPicture", a, this.lc);
        this.file.modified = !0;
      }.bind(this);
      this.lc.on("clear", a);
      this.lc.on("shapeEdit", a);
      this.lc.on("shapeSave", a);
      this.lc.on("toolChange", function(a) {
        this.updateEditMenu();
      }.bind(this));
      this.lc.on("lc-pointerdrag", this.stagemousemove.bind(this));
      this.lc.on("lc-pointermove", this.stagemousemove.bind(this));
      this.initTopBar();
      this.updateEditMenu();
      Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardPressControl);
      Entry.keyUpped && Entry.keyUpped.attach(this, this._keyboardUpControl);
    }
  };
  b.show = function() {
    this.lc || this.initialize();
    this.isShow = !0;
  };
  b.hide = function() {
    this.isShow = !1;
  };
  b.changePicture = function(a) {
    this.file && this.file.id === a.id || (this.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && this.file_save(!0), this.file.modified = !1, this.lc.clear(!1), this.file.id = a.id ? a.id : Entry.generateHash(), this.file.name = a.name, this.file.mode = "edit", this.addPicture(a, !0));
  };
  b.addPicture = function(a, b) {
    var c = new Image;
    c.src = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/image/" + a.filename + ".png";
    var e = a.dimension, f = LC.createShape("Image", {x:480, y:270, width:e.width, height:e.height, image:c});
    this.lc.saveShape(f, !b);
    c.onload = function() {
      this.lc.setTool(this.lc.tools.SelectShape);
      this.lc.tool.setShape(this.lc, f);
    }.bind(this);
  };
  b.copy = function() {
    if ("SelectShape" === this.lc.tool.name && this.lc.tool.selectedShape) {
      var a = this.lc.tool.selectedShape;
      this.clipboard = {className:a.className, data:a.toJSON()};
      this.updateEditMenu();
    }
  };
  b.cut = function() {
    "SelectShape" === this.lc.tool.name && this.lc.tool.selectedShape && (this.copy(), this.lc.removeShape(this.lc.tool.selectedShape), this.lc.tool.setShape(this.lc, null));
  };
  b.paste = function() {
    if (this.clipboard) {
      var a = this.lc.addShape(this.clipboard);
      this.lc.setTool(this.lc.tools.SelectShape);
      this.lc.tool.setShape(this.lc, a);
    }
  };
  b.updateEditMenu = function() {
    var a = "SelectShape" === this.lc.tool.name ? "block" : "none";
    this._cutButton.style.display = a;
    this._copyButton.style.display = a;
    this._pasteButton.style.display = this.clipboard ? "block" : "none";
  };
  b.file_save = function() {
    this.lc.trigger("dispose");
    var a = this.lc.getImage().toDataURL();
    this.file_ = JSON.parse(JSON.stringify(this.file));
    Entry.dispatchEvent("saveCanvasImage", {file:this.file_, image:a});
    this.file.modified = !1;
  };
  b.newPicture = function() {
    var a = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
    a.id = Entry.generateHash();
    Entry.playground.addPicture(a, !0);
  };
  b._keyboardPressControl = function(a) {
    if (this.isShow && !Entry.Utils.isInInput(a)) {
      var b = a.keyCode || a.which, c = a.ctrlKey;
      8 == b || 46 == b ? (this.cut(), a.preventDefault()) : c && (67 == b ? this.copy() : 88 == b && this.cut());
      c && 86 == b && this.paste();
      this.lc.trigger("keyDown", a);
    }
  };
  b._keyboardUpControl = function(a) {
    this.lc.trigger("keyUp", a);
  };
  b.initTopBar = function() {
    var a = this, b = Entry.createElement(document.getElementById("canvas-top-menu"));
    b.addClass("entryPlaygroundPainterTop");
    b.addClass("entryPainterTop");
    var c = Entry.createElement("nav", "entryPainterTopMenu");
    c.addClass("entryPlaygroundPainterTopMenu");
    b.appendChild(c);
    var e = Entry.createElement("ul");
    c.appendChild(e);
    var f = Entry.createElement("li");
    c.appendChild(f);
    c = Entry.createElement("a", "entryPainterTopMenuFileNew");
    c.bindOnClick(function() {
      a.newPicture();
    });
    c.addClass("entryPlaygroundPainterTopMenuFileNew");
    c.innerHTML = Lang.Workspace.new_picture;
    f.appendChild(c);
    c = Entry.createElement("li", "entryPainterTopMenuFile");
    c.addClass("entryPlaygroundPainterTopMenuFile");
    c.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(c);
    f = Entry.createElement("ul");
    c.appendChild(f);
    c = Entry.createElement("li");
    f.appendChild(c);
    var g = Entry.createElement("a", "entryPainterTopMenuFileSave");
    g.bindOnClick(function() {
      a.file_save(!1);
    });
    g.addClass("entryPainterTopMenuFileSave");
    g.innerHTML = Lang.Workspace.painter_file_save;
    c.appendChild(g);
    c = Entry.createElement("li");
    f.appendChild(c);
    f = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    f.bindOnClick(function() {
      a.file.mode = "new";
      a.file_save(!1);
    });
    f.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    f.innerHTML = Lang.Workspace.painter_file_saveas;
    c.appendChild(f);
    f = Entry.createElement("li", "entryPainterTopMenuEdit");
    f.addClass("entryPlaygroundPainterTopMenuEdit");
    f.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(f);
    e = Entry.createElement("ul");
    f.appendChild(e);
    f = Entry.createElement("li");
    e.appendChild(f);
    c = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    c.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    c.addClass("entryPainterTopMenuEditImport");
    c.innerHTML = Lang.Workspace.get_file;
    f.appendChild(c);
    f = Entry.createElement("li");
    e.appendChild(f);
    c = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    c.bindOnClick(function() {
      a.copy();
    });
    c.addClass("entryPlaygroundPainterTopMenuEditCopy");
    c.innerHTML = Lang.Workspace.copy_file;
    f.appendChild(c);
    this._copyButton = f;
    f = Entry.createElement("li");
    e.appendChild(f);
    c = Entry.createElement("a", "entryPainterTopMenuEditCut");
    c.bindOnClick(function() {
      a.cut();
    });
    c.addClass("entryPlaygroundPainterTopMenuEditCut");
    c.innerHTML = Lang.Workspace.cut_picture;
    f.appendChild(c);
    this._cutButton = f;
    f = Entry.createElement("li");
    e.appendChild(f);
    c = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    c.bindOnClick(function() {
      a.paste();
    });
    c.addClass("entryPlaygroundPainterTopMenuEditPaste");
    c.innerHTML = Lang.Workspace.paste_picture;
    f.appendChild(c);
    this._pasteButton = f;
    f = Entry.createElement("li");
    e.appendChild(f);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      a.lc.clear();
    });
    f.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    b.appendChild(e);
    Entry.addEventListener("pictureSelected", this.changePicture.bind(this));
  };
  b.stagemousemove = function(a) {
    this.painterTopStageXY.textContent = "x:" + a.x.toFixed(1) + ", y:" + a.y.toFixed(1);
  };
})(Entry.Painter2.prototype);
Entry.BlockParser = function(b) {
  this.syntax = b;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(b) {
  b.Code = function(a) {
    if (a instanceof Entry.Thread) {
      return this.Thread(a);
    }
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getThreads();
    for (var c = 0;c < a.length;c++) {
      b += this.Thread(a[c]);
    }
    return b;
  };
  b.Thread = function(a) {
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getBlocks();
    for (var c = 0;c < a.length;c++) {
      b += this.Block(a[c]);
    }
    return b;
  };
  b.Block = function(a) {
    var b = a._schema.syntax;
    return b ? this[b[0]](a) : "";
  };
  b.Program = function(a) {
    return "";
  };
  b.Scope = function(a) {
    a = a._schema.syntax.concat();
    return a.splice(1, a.length - 1).join(".") + "();\n";
  };
  b.BasicFunction = function(a) {
    a = this.Thread(a.statements[0]);
    return "function promise() {\n" + this.indent(a) + "}\n";
  };
  b.BasicIteration = function(a) {
    var b = a.params[0], c = this.publishIterateVariable();
    a = this.Thread(a.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + c + " = 0; " + c + " < " + b + "; " + c + "++){\n" + this.indent(a) + "}\n";
  };
  b.BasicIf = function(a) {
    var b = this.Thread(a.statements[0]);
    return "if (" + a._schema.syntax.concat()[1] + ") {\n" + this.indent(b) + "}\n";
  };
  b.BasicWhile = function(a) {
    var b = this.Thread(a.statements[0]);
    return "while (" + a._schema.syntax.concat()[1] + ") {\n" + this.indent(b) + "}\n";
  };
  b.indent = function(a) {
    var b = "    ";
    a = a.split("\n");
    a.pop();
    return b += a.join("\n    ") + "\n";
  };
  b.publishIterateVariable = function() {
    var a = "", b = this._iterVariableCount;
    do {
      a = this._iterVariableChunk[b % 3] + a, b = parseInt(b / 3) - 1, 0 === b && (a = this._iterVariableChunk[0] + a);
    } while (0 < b);
    this._iterVariableCount++;
    return a;
  };
  b.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
})(Entry.BlockParser.prototype);
Entry.JSParser = function(b) {
  this.syntax = b;
  this.scopeChain = [];
  this.scope = null;
};
(function(b) {
  b.Program = function(a) {
    var b = [], c = [];
    c.push({type:this.syntax.Program});
    var e = this.initScope(a), c = c.concat(this.BlockStatement(a));
    this.unloadScope();
    b.push(c);
    return b = b.concat(e);
  };
  b.Identifier = function(a, b) {
    return b ? b[a.name] : this.scope[a.name];
  };
  b.ExpressionStatement = function(a) {
    a = a.expression;
    return this[a.type](a);
  };
  b.ForStatement = function(a) {
    var b = a.init, c = a.test, e = a.update, f = a.body;
    if (this.syntax.ForStatement) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    var f = this[f.type](f), b = b.declarations[0].init.value, g = c.operator, c = c.right.value, h = 0;
    "++" != e.operator && (e = b, b = c, c = e);
    switch(g) {
      case "<":
        h = c - b;
        break;
      case "<=":
        h = c + 1 - b;
        break;
      case ">":
        h = b - c;
        break;
      case ">=":
        h = b + 1 - c;
    }
    return this.BasicIteration(a, h, f);
  };
  b.BlockStatement = function(a) {
    var b = [];
    a = a.body;
    for (var c = 0;c < a.length;c++) {
      var e = a[c], f = this[e.type](e);
      if (f) {
        if (void 0 === f.type) {
          throw {message:"\ud574\ub2f9\ud558\ub294 \ube14\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.", node:e};
        }
        f && b.push(f);
      }
    }
    return b;
  };
  b.EmptyStatement = function(a) {
    throw {message:"empty\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.DebuggerStatement = function(a) {
    throw {message:"debugger\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WithStatement = function(a) {
    throw {message:"with\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ReturnStaement = function(a) {
    throw {message:"return\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.LabeledStatement = function(a) {
    throw {message:"label\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.BreakStatement = function(a) {
    throw {message:"break\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ContinueStatement = function(a) {
    throw {message:"continue\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.IfStatement = function(a) {
    if (this.syntax.IfStatement) {
      throw {message:"if\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return this.BasicIf(a);
  };
  b.SwitchStatement = function(a) {
    throw {message:"switch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SwitchCase = function(a) {
    throw {message:"switch ~ case\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThrowStatement = function(a) {
    throw {message:"throw\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.TryStatement = function(a) {
    throw {message:"try\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CatchClause = function(a) {
    throw {message:"catch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WhileStatement = function(a) {
    var b = a.body, c = this.syntax.WhileStatement, b = this[b.type](b);
    if (c) {
      throw {message:"while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return this.BasicWhile(a, b);
  };
  b.DoWhileStatement = function(a) {
    throw {message:"do ~ while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ForInStatement = function(a) {
    throw {message:"for ~ in\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionDeclaration = function(a) {
    if (this.syntax.FunctionDeclaration) {
      throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return null;
  };
  b.VariableDeclaration = function(a) {
    throw {message:"var\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThisExpression = function(a) {
    return this.scope.this;
  };
  b.ArrayExpression = function(a) {
    throw {message:"array\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ObjectExpression = function(a) {
    throw {message:"object\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.Property = function(a) {
    throw {message:"init, get, set\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionExpression = function(a) {
    throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryOperator = function() {
    return "- + ! ~ typeof void delete".split(" ");
  };
  b.updateOperator = function() {
    return ["++", "--"];
  };
  b.BinaryOperator = function() {
    return "== != === !== < <= > >= << >> >>> + - * / % , ^ & in instanceof".split(" ");
  };
  b.AssignmentExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.AssignmentOperator = function() {
    return "= += -= *= /= %= <<= >>= >>>= ,= ^= &=".split(" ");
  };
  b.LogicalExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.LogicalOperator = function() {
    return ["||", "&&"];
  };
  b.MemberExpression = function(a) {
    var b = a.object, c = a.property;
    console.log(b.type);
    b = this[b.type](b);
    console.log(b);
    c = this[c.type](c, b);
    if (Object(b) !== b || Object.getPrototypeOf(b) !== Object.prototype) {
      throw {message:b + "\uc740(\ub294) \uc798\ubabb\ub41c \uba64\ubc84 \ubcc0\uc218\uc785\ub2c8\ub2e4.", node:a};
    }
    b = c;
    if (!b) {
      throw {message:c + "\uc774(\uac00) \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.", node:a};
    }
    return b;
  };
  b.ConditionalExpression = function(a) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UpdateExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CallExpression = function(a) {
    a = a.callee;
    return {type:this[a.type](a)};
  };
  b.NewExpression = function(a) {
    throw {message:"new\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SequenceExpression = function(a) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.initScope = function(a) {
    if (null === this.scope) {
      var b = function() {
      };
      b.prototype = this.syntax.Scope;
    } else {
      b = function() {
      }, b.prototype = this.scope;
    }
    this.scope = new b;
    this.scopeChain.push(this.scope);
    return this.scanDefinition(a);
  };
  b.unloadScope = function() {
    this.scopeChain.pop();
    this.scope = this.scopeChain.length ? this.scopeChain[this.scopeChain.length - 1] : null;
  };
  b.scanDefinition = function(a) {
    a = a.body;
    for (var b = [], c = 0;c < a.length;c++) {
      var e = a[c];
      "FunctionDeclaration" === e.type && (this.scope[e.id.name] = this.scope.promise, this.syntax.BasicFunction && (e = e.body, b.push([{type:this.syntax.BasicFunction, statements:[this[e.type](e)]}])));
    }
    return b;
  };
  b.BasicFunction = function(a, b) {
    return null;
  };
  b.BasicIteration = function(a, b, c) {
    var e = this.syntax.BasicIteration;
    if (!e) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return {params:[b], type:e, statements:[c]};
  };
  b.BasicWhile = function(a, b) {
    var c = a.test.raw;
    if (this.syntax.BasicWhile[c]) {
      return {type:this.syntax.BasicWhile[c], statements:[b]};
    }
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
  };
  b.BasicIf = function(a) {
    var b = a.consequent, b = this[b.type](b);
    try {
      var c = "", e = "===" === a.test.operator ? "==" : a.test.operator;
      if ("Identifier" === a.test.left.type && "Literal" === a.test.right.type) {
        c = a.test.left.name + " " + e + " " + a.test.right.raw;
      } else {
        if ("Literal" === a.test.left.type && "Identifier" === a.test.right.type) {
          c = a.test.right.name + " " + e + " " + a.test.left.raw;
        } else {
          throw Error();
        }
      }
      if (this.syntax.BasicIf[c]) {
        return Array.isArray(b) || "object" !== typeof b || (b = [b]), {type:this.syntax.BasicIf[c], statements:[b]};
      }
      throw Error();
    } catch (f) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
    }
  };
})(Entry.JSParser.prototype);
Entry.ParserOld = {};
Entry.Parser = function(b, a, d) {
  this._mode = b;
  this.syntax = {};
  this.codeMirror = d;
  this._lang = a || "js";
  this.availableCode = [];
  "maze" === b && (this._stageId = Number(Ntry.configManager.getConfig("stageId")), "object" == typeof NtryData && this.setAvailableCode(NtryData.config[this._stageId].availableCode, NtryData.player[this._stageId].code));
  this.mappingSyntax(b);
  switch(this._lang) {
    case "js":
      this._parser = new Entry.JSParser(this.syntax);
      a = this.syntax;
      var c = {}, e;
      for (e in a.Scope) {
        c[e + "();\n"] = a.Scope[e];
      }
      "BasicIf" in a && (c.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(a) {
        CodeMirror.showHint(a, null, {globalScope:c});
      };
      d.on("keyup", function(a, b) {
        !a.state.completionActive && 65 <= b.keyCode && 95 >= b.keyCode && CodeMirror.showHint(a, null, {completeSingle:!1, globalScope:c});
      });
      break;
    case "block":
      this._parser = new Entry.BlockParser(this.syntax);
  }
};
(function(b) {
  b.parse = function(a) {
    var b = null;
    switch(this._lang) {
      case "js":
        try {
          var c = acorn.parse(a), b = this._parser.Program(c);
        } catch (e) {
          this.codeMirror && (e instanceof SyntaxError ? (a = {from:{line:e.loc.line - 1, ch:e.loc.column - 2}, to:{line:e.loc.line - 1, ch:e.loc.column + 1}}, e.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (a = this.getLineNumber(e.node.start, e.node.end), a.message = e.message, a.severity = "error", this.codeMirror.markText(a.from, a.to, {className:"CodeMirror-lint-mark-error", __annotation:a, clearOnEnter:!0})), Entry.toast.alert("Error", e.message)), b = [];
        }
        break;
      case "block":
        a = this._parser.Code(a).match(/(.*{.*[\S|\s]+?}|.+)/g), b = Array.isArray(a) ? a.reduce(function(a, b, d) {
          var c = "";
          1 === d && (a += "\n");
          c = -1 < b.indexOf("function") ? b + a : a + b;
          return c + "\n";
        }) : "";
    }
    return b;
  };
  b.getLineNumber = function(a, b) {
    var c = this.codeMirror.getValue(), e = {from:{}, to:{}}, f = c.substring(0, a).split(/\n/gi);
    e.from.line = f.length - 1;
    e.from.ch = f[f.length - 1].length;
    c = c.substring(0, b).split(/\n/gi);
    e.to.line = c.length - 1;
    e.to.ch = c[c.length - 1].length;
    return e;
  };
  b.mappingSyntax = function(a) {
    for (var b = Object.keys(Entry.block), c = 0;c < b.length;c++) {
      var e = b[c], f = Entry.block[e];
      if (f.mode === a && -1 < this.availableCode.indexOf(e) && (f = f.syntax)) {
        for (var g = this.syntax, h = 0;h < f.length;h++) {
          var k = f[h];
          if (h === f.length - 2 && "function" === typeof f[h + 1]) {
            g[k] = f[h + 1];
            break;
          }
          g[k] || (g[k] = {});
          h === f.length - 1 ? g[k] = e : g = g[k];
        }
      }
    }
  };
  b.setAvailableCode = function(a, b) {
    var c = [];
    a.forEach(function(a, b) {
      a.forEach(function(a, b) {
        c.push(a.type);
      });
    });
    b instanceof Entry.Code ? b.getBlockList().forEach(function(a) {
      a.type !== NtryData.START && -1 === c.indexOf(a.type) && c.push(a.type);
    }) : b.forEach(function(a, b) {
      a.forEach(function(a, b) {
        a.type !== NtryData.START && -1 === c.indexOf(a.type) && c.push(a.type);
      });
    });
    this.availableCode = this.availableCode.concat(c);
  };
})(Entry.Parser.prototype);
Entry.Pdf = function(b) {
  this.generateView(b);
};
p = Entry.Pdf.prototype;
p.generateView = function(b) {
  var a = Entry.createElement("div", "entryPdfWorkspace");
  a.addClass("entryRemove");
  this._view = a;
  var d = "/pdfjs/web/viewer.html";
  b && "" != b && (d += "?file=" + b);
  pdfViewIframe = Entry.createElement("iframe", "entryPdfIframeWorkspace");
  pdfViewIframe.setAttribute("id", "pdfViewIframe");
  pdfViewIframe.setAttribute("frameborder", 0);
  pdfViewIframe.setAttribute("src", d);
  a.appendChild(pdfViewIframe);
};
p.getView = function() {
  return this._view;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("pdfViewIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.Popup = function() {
  Entry.assert(!window.popup, "Popup exist");
  this.body_ = Entry.createElement("div");
  this.body_.addClass("entryPopup");
  this.body_.bindOnClick(function(b) {
    b.target == this && this.popup.remove();
  });
  this.body_.popup = this;
  document.body.appendChild(this.body_);
  this.window_ = Entry.createElement("div");
  this.window_.addClass("entryPopupWindow");
  "tablet" === Entry.device && this.window_.addClass("tablet");
  this.window_.bindOnClick(function() {
  });
  Entry.addEventListener("windowResized", this.resize);
  window.popup = this;
  this.resize();
  this.body_.appendChild(this.window_);
};
Entry.Popup.prototype.remove = function() {
  for (;this.window_.hasChildNodes();) {
    "workspace" == Entry.type ? Entry.view_.insertBefore(this.window_.firstChild, Entry.container.view_) : Entry.view_.insertBefore(this.window_.lastChild, Entry.view_.firstChild);
  }
  $("body").css("overflow", "auto");
  Entry.removeElement(this.body_);
  window.popup = null;
  Entry.removeEventListener("windowResized", this.resize);
  Entry.engine.popup = null;
  Entry.windowResized.notify();
};
Entry.Popup.prototype.resize = function(b) {
  b = window.popup.window_;
  var a = .9 * window.innerWidth, d = .9 * window.innerHeight - 35;
  9 * a <= 16 * d ? d = a / 16 * 9 : a = 16 * d / 9;
  b.style.width = String(a) + "px";
  b.style.height = String(d + 35) + "px";
  Entry.stage && Entry.stage.updateBoundRect();
};
Entry.popupHelper = function(b) {
  this.popupList = {};
  this.nextPopupList = [];
  this.nowContent;
  b && (window.popupHelper = null);
  Entry.assert(!window.popupHelper, "Popup exist");
  var a = ["confirm", "spinner"], d = ["entryPopupHelperTopSpan", "entryPopupHelperBottomSpan", "entryPopupHelperLeftSpan", "entryPopupHelperRightSpan"];
  this.body_ = Entry.Dom("div", {classes:["entryPopup", "hiddenPopup", "popupHelper"]});
  var c = this;
  this.body_.bindOnClick(function(b) {
    if (!(c.nowContent && -1 < a.indexOf(c.nowContent.prop("type")))) {
      var f = $(b.target);
      d.forEach(function(a) {
        f.hasClass(a) && c.hide();
      });
      b.target == c && c.hide();
    }
  });
  window.popupHelper = this;
  this.body_.prop("popup", this);
  Entry.Dom("div", {class:"entryPopupHelperTopSpan", parent:this.body_});
  b = Entry.Dom("div", {class:"entryPopupHelperMiddleSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperBottomSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperLeftSpan", parent:b});
  this.window_ = Entry.Dom("div", {class:"entryPopupHelperWindow", parent:b});
  Entry.Dom("div", {class:"entryPopupHelperRightSpan", parent:b});
  $("body").append(this.body_);
};
Entry.popupHelper.prototype.clearPopup = function() {
  for (var b = this.popupWrapper_.children.length - 1;2 < b;b--) {
    this.popupWrapper_.removeChild(this.popupWrapper_.children[b]);
  }
};
Entry.popupHelper.prototype.addPopup = function(b, a) {
  var d = Entry.Dom("div"), c = Entry.Dom("div", {class:"entryPopupHelperCloseButton"});
  c.bindOnClick(function() {
    a.closeEvent ? a.closeEvent(this) : this.hide();
  }.bind(this));
  var e = Entry.Dom("div", {class:"entryPopupHelperWrapper"});
  e.append(c);
  a.title && (c = Entry.Dom("div", {class:"entryPopupHelperTitle"}), e.append(c), c.text(a.title));
  d.addClass(b);
  d.append(e);
  d.popupWrapper_ = e;
  d.prop("type", a.type);
  "function" === typeof a.setPopupLayout && a.setPopupLayout(d);
  d._obj = a;
  this.popupList[b] = d;
};
Entry.popupHelper.prototype.hasPopup = function(b) {
  return !!this.popupList[b];
};
Entry.popupHelper.prototype.setPopup = function(b) {
};
Entry.popupHelper.prototype.remove = function(b) {
  0 < this.window_.children().length && this.window_.children().remove();
  delete this.popupList[b];
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
  0 < this.nextPopupList.length && this.show(this.nextPopupList.shift());
};
Entry.popupHelper.prototype.resize = function(b) {
};
Entry.popupHelper.prototype.show = function(b, a) {
  function d(a) {
    c.window_.append(c.popupList[a]);
    c.nowContent = c.popupList[a];
    c.body_.removeClass("hiddenPopup");
  }
  var c = this;
  a ? 0 < this.window_.children().length ? this.nextPopupList.push(b) : (this.window_.children().detach(), d(b)) : (this.window_.children().detach(), d(b));
  if (this.nowContent && this.nowContent._obj && this.nowContent._obj.onShow) {
    this.nowContent._obj.onShow();
  }
};
Entry.popupHelper.prototype.hide = function() {
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
  this.window_.children().detach();
  0 < this.nextPopupList.length && this.show(this.nextPopupList.shift());
};
Entry.getStartProject = function(b) {
  return {category:"\uae30\ud0c0", scenes:[{name:"\uc7a5\uba74 1", id:"7dwq"}], variables:[{name:"\ucd08\uc2dc\uacc4", id:"brih", visible:!1, value:"0", variableType:"timer", x:150, y:-70, array:[], object:null, isCloud:!1}, {name:"\ub300\ub2f5", id:"1vu8", visible:!1, value:"0", variableType:"answer", x:150, y:-100, array:[], object:null, isCloud:!1}], objects:[{id:"7y0y", name:"\uc5d4\ud2b8\ub9ac\ubd07", script:[[{type:"when_run_button_click", x:40, y:50}, {type:"repeat_basic", statements:[[{type:"move_direction"}]]}]], 
  selectedPictureId:"vx80", objectType:"sprite", rotateMethod:"free", scene:"7dwq", sprite:{sounds:[{duration:1.3, ext:".mp3", id:"8el5", fileurl:b + "media/bark.mp3", name:"\uac15\uc544\uc9c0 \uc9d6\ub294\uc18c\ub9ac"}], pictures:[{id:"vx80", fileurl:b + "media/entrybot1.png", name:Lang.Blocks.walking_entryBot + "1", scale:100, dimension:{width:284, height:350}}, {id:"4t48", fileurl:b + "media/entrybot2.png", name:Lang.Blocks.walking_entryBot + "2", scale:100, dimension:{width:284, height:350}}]}, 
  entity:{x:0, y:0, regX:142, regY:175, scaleX:.3154574132492113, scaleY:.3154574132492113, rotation:0, direction:90, width:284, height:350, visible:!0}, lock:!1, active:!0}], speed:60};
};
Entry.PropertyPanel = function() {
  this.modes = {};
  this.selected = null;
};
(function(b) {
  b.generateView = function(a, b) {
    this._view = Entry.Dom("div", {class:"propertyPanel", parent:$(a)});
    this._tabView = Entry.Dom("div", {class:"propertyTab", parent:this._view});
    this._contentView = Entry.Dom("div", {class:"propertyContent", parent:this._view});
    this._cover = Entry.Dom("div", {classes:["propertyPanelCover", "entryRemove"], parent:this._view});
    var c = Entry.Dom("div", {class:"entryObjectSelectedImgWorkspace", parent:this._view});
    this.initializeSplitter(c);
  };
  b.addMode = function(a, b) {
    var c = b.getView(), c = Entry.Dom(c, {parent:this._contentView}), e = Entry.Dom("<div>" + Lang.Menus[a] + "</div>", {classes:["propertyTabElement", "propertyTab" + a], parent:this._tabView}), f = this;
    e.bind("click", function() {
      f.select(a);
    });
    this.modes[a] && (this.modes[a].tabDom.remove(), this.modes[a].contentDom.remove(), "hw" == a && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    this.modes[a] = {obj:b, tabDom:e, contentDom:c};
    "hw" == a && $(".propertyTabhw").bind("dblclick", function() {
      Entry.dispatchEvent("hwModeChange");
    });
  };
  b.removeMode = function(a) {
    this.modes[a] && (this.modes[a].tabDom.remove(), this.modes[a].contentDom.remove(), "hw" == a && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    (a = Object.keys(this.modes)) && 0 < a.length && this.select(a[0]);
  };
  b.resize = function(a) {
    this._view.css({width:a + "px", top:9 * a / 16 + 123 - 22 + "px"});
    430 <= a ? this._view.removeClass("collapsed") : this._view.addClass("collapsed");
    Entry.dispatchEvent("windowResized");
    a = this.selected;
    "hw" == a ? this.modes.hw.obj.listPorts ? this.modes[a].obj.resizeList() : this.modes[a].obj.resize() : this.modes[a].obj.resize();
  };
  b.select = function(a) {
    for (var b in this.modes) {
      var c = this.modes[b];
      c.tabDom.removeClass("selected");
      c.contentDom.addClass("entryRemove");
      c.obj.visible = !1;
    }
    b = this.modes[a];
    b.tabDom.addClass("selected");
    b.contentDom.removeClass("entryRemove");
    b.obj.resize && b.obj.resize();
    b.obj.visible = !0;
    this.selected = a;
  };
  b.initializeSplitter = function(a) {
    var b = this;
    a.bind("mousedown touchstart", function(a) {
      b._cover.removeClass("entryRemove");
      b._cover._isVisible = !0;
      Entry.container.disableSort();
      Entry.container.splitterEnable = !0;
      Entry.documentMousemove && (Entry.container.resizeEvent = Entry.documentMousemove.attach(this, function(a) {
        Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.clientX || a.x});
      }));
    });
    $(document).bind("mouseup touchend", function(a) {
      if (a = Entry.container.resizeEvent) {
        Entry.container.splitterEnable = !1, Entry.documentMousemove.detach(a), delete Entry.container.resizeEvent;
      }
      b._cover._isVisible && (b._cover._isVisible = !1, b._cover.addClass("entryRemove"));
      Entry.container.enableSort();
    });
  };
})(Entry.PropertyPanel.prototype);
Entry.Reporter = function(b) {
  this.projectId = this.userId = null;
  this.isRealTime = b;
  this.activities = [];
};
Entry.Reporter.prototype.start = function(b, a, d) {
  this.isRealTime && (-1 < window.location.href.indexOf("localhost") ? this.io = io("localhost:7000") : this.io = io("play04.play-entry.com:7000"), this.io.emit("activity", {message:"start", userId:a, projectId:b, time:d}));
  this.userId = a;
  this.projectId = b;
};
Entry.Reporter.prototype.report = function(b) {
  if (!this.isRealTime || this.io) {
    var a = [], d;
    for (d in b.params) {
      var c = b.params[d];
      "object" !== typeof c ? a.push(c) : c.id && a.push(c.id);
    }
    b = {message:b.message, userId:this.userId, projectId:this.projectId, time:b.time, params:a};
    this.isRealTime ? this.io.emit("activity", b) : this.activities.push(b);
  }
};
Entry.Scene = function() {
  var b = this;
  this.scenes_ = [];
  this.selectedScene = null;
  this.maxCount = 20;
  $(window).on("resize", function(a) {
    b.resize();
  });
};
Entry.Scene.viewBasicWidth = 70;
Entry.Scene.prototype.generateView = function(b, a) {
  var d = this;
  this.view_ = b;
  this.view_.addClass("entryScene");
  if (!a || "workspace" == a) {
    this.view_.addClass("entrySceneWorkspace");
    $(this.view_).on("mousedown", function(a) {
      var b = $(this).offset(), c = $(window), h = a.pageX - b.left + c.scrollLeft();
      a = a.pageY - b.top + c.scrollTop();
      a = 40 - a;
      b = -40 / 55;
      c = $(d.selectedScene.view).find(".entrySceneRemoveButtonCoverWorkspace").offset().left;
      !(h < c || h > c + 55) && a > 40 + b * (h - c) && (h = d.getNextScene()) && (h = $(h.view), $(document).trigger("mouseup"), h.trigger("mousedown"));
    });
    var c = Entry.createElement("ul");
    c.addClass("entrySceneListWorkspace");
    Entry.sceneEditable && $ && $(c).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
      $(b.item[0]).clone(!0);
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), c = b.item.index();
      Entry.scene.moveScene(d, c);
    }, axis:"x", tolerance:"pointer"});
    this.view_.appendChild(c);
    this.listView_ = c;
    Entry.sceneEditable && (c = Entry.createElement("span"), c.addClass("entrySceneElementWorkspace"), c.addClass("entrySceneAddButtonWorkspace"), c.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.scene.addScene();
    }), this.view_.appendChild(c), this.addButton_ = c);
  }
};
Entry.Scene.prototype.generateElement = function(b) {
  var a = this, d = Entry.createElement("li", b.id);
  d.addClass("entrySceneElementWorkspace");
  d.addClass("entrySceneButtonWorkspace");
  d.addClass("minValue");
  $(d).on("mousedown", function(a) {
    Entry.engine.isState("run") ? a.preventDefault() : Entry.scene.selectScene(b);
  });
  var c = Entry.createElement("input");
  c.addClass("entrySceneFieldWorkspace");
  c.value = b.name;
  Entry.sceneEditable || (c.disabled = "disabled");
  var e = Entry.createElement("span");
  e.addClass("entrySceneLeftWorkspace");
  d.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entrySceneInputCover");
  f.style.width = Entry.computeInputWidth(b.name);
  d.appendChild(f);
  b.inputWrapper = f;
  c.onkeyup = function(d) {
    d = d.keyCode;
    Entry.isArrowOrBackspace(d) || (b.name = this.value, f.style.width = Entry.computeInputWidth(b.name), a.resize(), 13 == d && this.blur(), 10 < this.value.length && (this.value = this.value.substring(0, 10), this.blur()));
  };
  c.onblur = function(a) {
    c.value = this.value;
    b.name = this.value;
    f.style.width = Entry.computeInputWidth(b.name);
  };
  f.appendChild(c);
  e = Entry.createElement("span");
  e.addClass("entrySceneRemoveButtonCoverWorkspace");
  d.appendChild(e);
  if (Entry.sceneEditable) {
    var g = Entry.createElement("button");
    g.addClass("entrySceneRemoveButtonWorkspace");
    g.scene = b;
    g.bindOnClick(function(a) {
      a.stopPropagation();
      Entry.engine.isState("run") || confirm(Lang.Workspace.will_you_delete_scene) && Entry.scene.removeScene(this.scene);
    });
    e.appendChild(g);
  }
  Entry.Utils.disableContextmenu(d);
  $(d).on("contextmenu", function() {
    var a = [{text:Lang.Workspace.duplicate_scene, enable:Entry.engine.isState("stop") && !this.isMax(), callback:function() {
      Entry.scene.cloneScene(b);
    }}];
    Entry.ContextMenu.show(a, "workspace-contextmenu");
  }.bind(this));
  return b.view = d;
};
Entry.Scene.prototype.updateView = function() {
  if (!Entry.type || "workspace" == Entry.type) {
    for (var b = this.listView_, a = $(b).children().length;a < this.getScenes().length;a++) {
      b.appendChild(this.getScenes()[a].view);
    }
    this.addButton_ && (this.getScenes(), this.isMax() ? this.addButton_.addClass("entryRemove") : this.addButton_.removeClass("entryRemove"));
  }
  this.resize();
};
Entry.Scene.prototype.addScenes = function(b) {
  if ((this.scenes_ = b) && 0 !== b.length) {
    for (var a = 0, d = b.length;a < d;a++) {
      this.generateElement(b[a]);
    }
  } else {
    this.scenes_ = [], this.scenes_.push(this.createScene());
  }
  this.selectScene(this.getScenes()[0]);
  this.updateView();
};
Entry.Scene.prototype.addScene = function(b, a) {
  void 0 === b && (b = this.createScene());
  b.view || this.generateElement(b);
  a || "number" == typeof a ? this.getScenes().splice(a, 0, b) : this.getScenes().push(b);
  Entry.stage.objectContainers.push(Entry.stage.createObjectContainer(b));
  Entry.playground.flushPlayground();
  this.selectScene(b);
  this.updateView();
  return b;
};
Entry.Scene.prototype.removeScene = function(b) {
  if (1 >= this.getScenes().length) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_delete_error, !1);
  } else {
    var a = this.getScenes().indexOf(this.getSceneById(b.id));
    this.getScenes().splice(a, 1);
    for (var a = Entry.container.getSceneObjects(b), d = 0;d < a.length;d++) {
      Entry.container.removeObject(a[d]);
    }
    Entry.stage.removeObjectContainer(b);
    $(b.view).remove();
    this.selectScene();
  }
};
Entry.Scene.prototype.selectScene = function(b) {
  b = b || this.getScenes()[0];
  if (!this.selectedScene || this.selectedScene.id != b.id) {
    Entry.engine.isState("run") && Entry.container.resetSceneDuringRun();
    var a = this.selectedScene;
    a && (a = a.view, a.removeClass("selectedScene"), a = $(a), a.find("input").blur());
    this.selectedScene = b;
    b.view.addClass("selectedScene");
    Entry.container.setCurrentObjects();
    Entry.stage.objectContainers && 0 !== Entry.stage.objectContainers.length && Entry.stage.selectObjectContainer(b);
    (b = Entry.container.getCurrentObjects()[0]) && "minimize" != Entry.type ? (Entry.container.selectObject(b.id), Entry.playground.refreshPlayground()) : (Entry.stage.selectObject(null), Entry.playground.flushPlayground(), Entry.variableContainer.updateList());
    Entry.container.listView_ || Entry.stage.sortZorder();
    Entry.container.updateListView();
    this.updateView();
    Entry.requestUpdate = !0;
  }
};
Entry.Scene.prototype.toJSON = function() {
  for (var b = [], a = this.getScenes().length, d = 0;d < a;d++) {
    var c = this.getScenes()[d], e = c.view, f = c.inputWrapper;
    delete c.view;
    delete c.inputWrapper;
    b.push(JSON.parse(JSON.stringify(c)));
    c.view = e;
    c.inputWrapper = f;
  }
  return b;
};
Entry.Scene.prototype.moveScene = function(b, a) {
  this.getScenes().splice(a, 0, this.getScenes().splice(b, 1)[0]);
  Entry.container.updateObjectsOrder();
  Entry.stage.sortZorder();
  $(".entrySceneElementWorkspace").removeAttr("style");
};
Entry.Scene.prototype.getSceneById = function(b) {
  for (var a = this.getScenes(), d = 0;d < a.length;d++) {
    if (a[d].id == b) {
      return a[d];
    }
  }
  return !1;
};
Entry.Scene.prototype.getScenes = function() {
  return this.scenes_;
};
Entry.Scene.prototype.takeStartSceneSnapshot = function() {
  this.sceneBeforeRun = this.selectedScene;
};
Entry.Scene.prototype.loadStartSceneSnapshot = function() {
  this.selectScene(this.sceneBeforeRun);
  this.sceneBeforeRun = null;
};
Entry.Scene.prototype.createScene = function() {
  var b = {name:Lang.Blocks.SCENE + " " + (this.getScenes().length + 1), id:Entry.generateHash()};
  this.generateElement(b);
  return b;
};
Entry.Scene.prototype.cloneScene = function(b) {
  if (this.isMax()) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_add_error, !1);
  } else {
    var a = {name:b.name + Lang.Workspace.replica_of_object, id:Entry.generateHash()};
    this.generateElement(a);
    this.addScene(a);
    b = Entry.container.getSceneObjects(b);
    for (var d = b.length - 1;0 <= d;d--) {
      Entry.container.addCloneObject(b[d], a.id);
    }
  }
};
Entry.Scene.prototype.resize = function() {
  var b = this.getScenes(), a = this.selectedScene, d = b[0];
  if (0 !== b.length && d) {
    var c = $(d.view).offset().left, d = parseFloat($(a.view).css("margin-left")), e = $(this.view_).width() - c, f = 0, g;
    for (g in b) {
      var c = b[g], h = c.view;
      h.addClass("minValue");
      $(c.inputWrapper).width(Entry.computeInputWidth(c.name));
      h = $(h);
      f = f + h.width() + d;
    }
    if (f > e) {
      for (g in e -= $(a.view).width(), d = e / (b.length - 1) - (Entry.Scene.viewBasicWidth + d), b) {
        c = b[g], a.id != c.id ? (c.view.removeClass("minValue"), $(c.inputWrapper).width(d)) : c.view.addClass("minValue");
      }
    }
  }
};
Entry.Scene.prototype.getNextScene = function() {
  var b = this.getScenes();
  return b[b.indexOf(this.selectedScene) + 1];
};
Entry.Scene.prototype.isMax = function() {
  return this.scenes_.length >= this.maxCount;
};
Entry.Scene.prototype.clear = function() {
  this.scenes_.map(function(b) {
    Entry.stage.removeObjectContainer(b);
  });
  $(this.listView_).html("");
  this.scenes_ = [];
};
Entry.Script = function(b) {
  this.entity = b;
};
p = Entry.Script.prototype;
p.init = function(b, a, d) {
  Entry.assert("BLOCK" == b.tagName.toUpperCase(), b.tagName);
  this.type = b.getAttribute("type");
  this.id = Number(b.getAttribute("id"));
  b.getElementsByTagName("mutation").length && b.getElementsByTagName("mutation")[0].hasAttribute("hashid") && (this.hashId = b.childNodes[0].getAttribute("hashid"));
  "REPEAT" == this.type.substr(0, 6).toUpperCase() && (this.isRepeat = !0);
  a instanceof Entry.Script && (this.previousScript = a, a.parentScript && (this.parentScript = a.parentScript));
  d instanceof Entry.Script && (this.parentScript = d);
  b = b.childNodes;
  for (a = 0;a < b.length;a++) {
    if (d = b[a], "NEXT" == d.tagName.toUpperCase()) {
      this.nextScript = new Entry.Script(this.entity), this.register && (this.nextScript.register = this.register), this.nextScript.init(b[a].childNodes[0], this);
    } else {
      if ("VALUE" == d.tagName.toUpperCase()) {
        this.values || (this.values = {});
        var c = new Entry.Script(this.entity);
        this.register && (c.register = this.register);
        c.init(d.childNodes[0]);
        this.values[d.getAttribute("name")] = c;
      } else {
        "FIELD" == d.tagName.toUpperCase() ? (this.fields || (this.fields = {}), this.fields[d.getAttribute("name")] = d.textContent) : "STATEMENT" == d.tagName.toUpperCase() && (this.statements || (this.statements = {}), c = new Entry.Script(this.entity), this.register && (c.register = this.register), c.init(d.childNodes[0], null, this), c.key = d.getAttribute("name"), this.statements[d.getAttribute("name")] = c);
      }
    }
  }
};
p.clone = function(b, a) {
  var d = new Entry.Script(b);
  d.id = this.id;
  d.type = this.type;
  d.isRepeat = this.isRepeat;
  if (this.parentScript && !this.previousScript && 2 != a) {
    d.parentScript = this.parentScript.clone(b);
    for (var c = d.parentScript.statements[this.key] = d;c.nextScript;) {
      c = c.nextScript, c.parentScript = d.parentScript;
    }
  }
  this.nextScript && 1 != a && (d.nextScript = this.nextScript.clone(b, 0), d.nextScript.previousScript = this);
  this.previousScript && 0 !== a && (d.previousScript = this.previousScript.clone(b, 1), d.previousScript.previousScript = this);
  if (this.fields) {
    d.fields = {};
    for (var e in this.fields) {
      d.fields[e] = this.fields[e];
    }
  }
  if (this.values) {
    for (e in d.values = {}, this.values) {
      d.values[e] = this.values[e].clone(b);
    }
  }
  if (this.statements) {
    for (e in d.statements = {}, this.statements) {
      for (d.statements[e] = this.statements[e].clone(b, 2), c = d.statements[e], c.parentScript = d;c.nextScript;) {
        c = c.nextScript, c.parentScript = d;
      }
    }
  }
  return d;
};
p.getStatement = function(b) {
  return this.statements[b];
};
p.compute = function() {
};
p.getValue = function(b) {
  return this.values[b].run();
};
p.getNumberValue = function(b) {
  return Number(this.values[b].run());
};
p.getStringValue = function(b) {
  return String(this.values[b].run());
};
p.getBooleanValue = function(b) {
  return this.values[b].run() ? !0 : !1;
};
p.getField = function(b) {
  return this.fields[b];
};
p.getStringField = function(b) {
  return String(this.fields[b]);
};
p.getNumberField = function(b) {
  return Number(this.fields[b]);
};
p.callReturn = function() {
  return this.nextScript ? this.nextScript : this.parentScript ? this.parentScript : null;
};
p.run = function() {
  return Entry.block[this.type](this.entity, this);
};
Entry.StampEntity = function(b, a) {
  this.parent = b;
  this.type = b.objectType;
  this.isStamp = this.isClone = !0;
  this.width = a.getWidth();
  this.height = a.getHeight();
  "sprite" == this.type && (this.object = a.object.clone(!0), this.object.filters = null, a.effect && (this.effect = Entry.cloneSimpleObject(a.effect), this.applyFilter()));
  this.object.entity = this;
};
(function(b, a) {
  b.applyFilter = a.applyFilter;
  b.removeClone = a.removeClone;
  b.getWidth = a.getWidth;
  b.getHeight = a.getHeight;
  b.getInitialEffectValue = a.getInitialEffectValue;
})(Entry.StampEntity.prototype, Entry.EntityObject.prototype);
Entry.JsAstGenerator = function() {
};
(function(b) {
  b.generate = function(a) {
    return arcon.parse(a);
  };
})(Entry.JsAstGenerator.prototype);
Entry.PyAstGenerator = function() {
};
(function(b) {
  b.generate = function(a) {
    var b = filbert.parse, c = {locations:!1, ranges:!1}, e;
    try {
      return e = b(a, c), console.log("astTree", e), e;
    } catch (f) {
      throw f.message = "  \ud30c\uc774\uc36c \ubb38\ubc95\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694", f;
    }
  };
})(Entry.PyAstGenerator.prototype);
Entry.Map = function() {
  this._map = {repo:{}};
};
(function(b) {
  b.getKey = function(a) {
    return a;
  };
  b.put = function(a, b) {
    var c = this.getKey(a);
    this._map.repo[c] = b;
  };
  b.contains = function(a) {
    a = this.getKey(a);
    return this._map.repo[a] ? !0 : !1;
  };
  b.get = function(a) {
    a = this.getKey(a);
    return this._map.repo[a] ? this._map.repo[a] : null;
  };
  b.remove = function(a) {
    var b = this.getKey(a);
    this.contains(a) && (this._map.repo[b] = void 0);
  };
  b.clear = function() {
    this._map.repo = {};
  };
  b.toString = function() {
    return this._map.repo;
  };
})(Entry.Map.prototype);
Entry.Queue = function() {
  this.tail = this.head = null;
};
function Node(b) {
  this.data = b;
  this.next = null;
}
(function(b) {
  b.enqueue = function(a) {
    a = new Node(a);
    null === this.head ? this.head = a : this.tail.next = a;
    this.tail = a;
  };
  b.dequeue = function() {
    var a;
    null !== this.head && (a = this.head.data, this.head = this.head.next);
    return a;
  };
  b.clear = function() {
    for (;this.dequeue();) {
    }
  };
  b.toString = function() {
    for (var a = this.head, b = [];a;) {
      b.push(a.data), a = a.next;
    }
    return b.toString();
  };
})(Entry.Queue.prototype);
Entry.PyHint = function() {
  function b(a, b, d) {
    a = fuzzy.filter(b, a, d);
    return a = a.map(function(a) {
      return a.original;
    });
  }
  CodeMirror.registerHelper("hint", "python", function(c) {
    var e = c.getCursor(), f = c.getTokenAt(e);
    /^[\w$_]*$/.test(f.string) || (f = {start:e.ch, end:e.ch, string:"", state:f.state, className:":" == f.string ? "python-type" : null});
    var g = [], h = f.string, r;
    if ("variable" == f.type) {
      r = f.string, null != r && (g = g.concat(b(a, h)), g = g.concat(b(d._global, h, {extract:function(a) {
        return a.displayText;
      }})));
    } else {
      if ("property" == f.type || "variable-2" == f.type || "." == f.state.lastToken) {
        r = f.string;
        c = c.getLineTokens(e.line);
        for (var t = c.shift();"variable" !== t.type && "variable-2" !== t.type;) {
          t = c.shift();
        }
        c = t.string;
        null != r && d[c] && (g = g.concat(b(d[c], h, {extract:function(a) {
          return a.displayText;
        }})));
        "." == f.state.lastToken && (g = g.concat(d[c]));
      }
    }
    return {list:g.slice(0, 25), from:CodeMirror.Pos(e.line, f.start), to:CodeMirror.Pos(e.line, f.end)};
  });
  var a = "Entry;self;Hw;while True;True;False;break;for i in range;if;if else;len;random.randint".split(";"), d = {_global:[]}, c = Entry.block, e;
  for (e in c) {
    var f = c[e].syntax;
    if (f && f.py) {
      f = f.py.join("");
      f = f.split(".");
      if (-1 < f[0].indexOf("def ")) {
        f = f[0].split(" ");
      } else {
        if (1 === f.length) {
          continue;
        }
      }
      var g = f.shift();
      d[g] || (d[g] = [], d._global.push({displayText:g, text:g}));
      var f = f[0].split(","), h = "(" + Array(f.length).join(" , ") + ")", f = f[0].split("(")[0];
      d[g].push({displayText:f, text:f + h});
      "def" == g ? d._global.push({displayText:g + " " + f, text:g + " " + f + h}) : d._global.push({displayText:g + "." + f, text:g + "." + f + h});
    }
  }
};
Entry.KeyboardCode = function() {
};
(function(b) {
  b.keyCodeToChar = {8:"Backspace", 9:"Tab", 13:"Enter", 16:"Shift", 17:"Ctrl", 18:"Alt", 19:"Pause/Break", 20:"Caps Lock", 27:"Esc", 32:"Space", 33:"Page Up", 34:"Page Down", 35:"End", 36:"Home", 37:"Left", 38:"Up", 39:"Right", 40:"Down", 45:"Insert", 46:"Delete", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 65:"A", 66:"B", 67:"C", 68:"D", 69:"E", 70:"F", 71:"G", 72:"H", 73:"I", 74:"J", 75:"K", 76:"L", 77:"M", 78:"N", 79:"O", 80:"P", 81:"Q", 82:"R", 83:"S", 84:"T", 
  85:"U", 86:"V", 87:"W", 88:"X", 89:"Y", 90:"Z", 91:"Windows", 93:"Right Click", 96:"Numpad 0", 97:"Numpad 1", 98:"Numpad 2", 99:"Numpad 3", 100:"Numpad 4", 101:"Numpad 5", 102:"Numpad 6", 103:"Numpad 7", 104:"Numpad 8", 105:"Numpad 9", 106:"Numpad *", 107:"Numpad +", 109:"Numpad -", 110:"Numpad .", 111:"Numpad /", 112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 144:"Num Lock", 145:"Scroll Lock", 182:"My Computer", 183:"My Calculator", 
  186:";", 187:"=", 188:",", 189:"-", 190:".", 191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"'"};
  b.keyCharToCode = {Backspace:8, Tab:9, Enter:13, Shift:16, Ctrl:17, Alt:18, "Pause/Break":19, "Caps Lock":20, Esc:27, Space:32, "Page Up":33, "Page Down":34, End:35, Home:36, Left:37, Up:38, Right:39, Down:40, Insert:45, Delete:46, 0:48, 1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, Windows:91, "Right Click":93, "Numpad 0":96, "Numpad 1":97, 
  "Numpad 2":98, "Numpad 3":99, "Numpad 4":100, "Numpad 5":101, "Numpad 6":102, "Numpad 7":103, "Numpad 8":104, "Numpad 9":105, "Numpad *":106, "Numpad +":107, "Numpad -":109, "Numpad .":110, "Numpad /":111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, "Num Lock":144, "Scroll Lock":145, "My Computer":182, "My Calculator":183, ";":186, "=":187, ",":188, "-":189, ".":190, "/":191, "`":192, "[":219, "\\":220, "]":221, "'":222};
})(Entry.KeyboardCode.prototype);
Entry.Console = function() {
  Entry.propertyPanel && (this.createView(), Entry.propertyPanel.addMode("console", this), Entry.console = this, this._isEditing = !1, this._inputData = null);
};
(function(b) {
  b.createView = function() {
    this.view = new Entry.Dom("div", {id:"entryConsole"});
    this.codeMirror = CodeMirror(this.view[0], {lineNumbers:!1, lineWrapping:!0, value:"", mode:{}, theme:"default", styleActiveLine:!1, lint:!1});
    this._doc = this.codeMirror.getDoc();
    this.codeMirror.on("beforeChange", function(a, b) {
      this._isEditing ? "+delete" === b.origin && 0 === b.to.ch && b.cancel() : b.cancel();
    }.bind(this));
    this.codeMirror.on("keyup", function(a, b) {
      this._isEditing && 13 === b.keyCode && this.endInput();
    }.bind(this));
    this.codeMirror.on("cursorActivity", function(a, b) {
      a.execCommand("goDocEnd");
    });
    Entry.addEventListener("stop", this.clear.bind(this));
    this.clear();
  };
  b.getView = function() {
    return this.view;
  };
  b.clear = function() {
    this.setEditing(!0);
    this.codeMirror.setValue("Entry Console \n");
    this.codeMirror.execCommand("goDocEnd");
    this.setEditing(!1);
  };
  b.print = function(a, b) {
    this.setEditing(!0);
    this.codeMirror.execCommand("goDocEnd");
    var c = this._doc.getCursor();
    this._doc.replaceRange(a + "\n", {line:c.line, ch:0});
    this._doc.addLineClass(c.line, "text", b);
    "speak" === b && this.setEditing(!1);
    this.codeMirror.execCommand("goDocEnd");
    "ask" === b && (this._doc.addLineClass(c.line + 1, "text", "answer"), this.codeMirror.focus());
  };
  b.endInput = function() {
    var a = this._doc.getCursor(), b = this.codeMirror.lineInfo(a.line);
    "answer" === b.textClass ? (this._inputData = b.text, this._doc.replaceRange("\n", {line:a.line, ch:b.text.length})) : this._inputData = this._doc.getLine(a.line - 1);
    Entry.container.setInputValue(this._inputData);
    this.setEditing(!1);
  };
  b.stopInput = function(a) {
    this.setEditing(!1);
  };
  b.setEditing = function(a) {
    this._isEditing !== a && (this._isEditing = a);
  };
})(Entry.Console.prototype);
Entry.TextCodingUtil = function() {
};
(function(b) {
  b._funcParamQ;
  b.initQueue = function() {
    this._funcParamQ = new Entry.Queue;
    this._funcNameQ = new Entry.Queue;
  };
  b.clearQueue = function() {
    this._funcParamQ.clear();
    this._funcNameQ.clear();
  };
  b.indent = function(a) {
    var b = "\t";
    a = a.split("\n");
    a.pop();
    b += a.join("\n\t");
    return b = "\t" + b.trim();
  };
  b.isNumeric = function(a) {
    return a.match(/^-?\d+$|^-\d+$/) || a.match(/^-?\d+\.\d+$/) ? !0 : !1;
  };
  b.isBinaryOperator = function(a) {
    return "==" == a || ">" == a || "<" == a || ">=" == a || "<=" == a || "+" == a || "-" == a || "*" == a || "/" == a ? !0 : !1;
  };
  b.binaryOperatorConvert = function(a) {
    switch(a) {
      case "==":
        a = "EQUAL";
        break;
      case ">":
        a = "GREATER";
        break;
      case "<":
        a = "LESS";
        break;
      case ">=":
        a = "GREATER_OR_EQUAL";
        break;
      case "<=":
        a = "LESS_OR_EQUAL";
        break;
      case "+":
        a = "PLUS";
        break;
      case "-":
        a = "MINUS";
        break;
      case "*":
        a = "MULTIFLY";
        break;
      case "/":
        a = "DIVIDE";
        break;
    }
    return a;
  };
  b.logicalExpressionConvert = function(a) {
    switch(a) {
      case "&&":
        a = null;
        break;
      case "||":
        a = null;
        break;
    }
    return a;
  };
  b.dropdownDynamicValueConvertor = function(a, b) {
    var c = b.options, e = null, f;
    for (f in c) {
      e = c[f];
      if ("null" == e[1]) {
        return e = {};
      }
      if ("mouse" == a || "wall" == a || "wall_up" == a || "wall_down" == a || "wall_right" == a || "wall_left" == a) {
        return a;
      }
      if (a == e[1]) {
        return console.log("dropdownDynamicValueConvertor value", a, e[1]), e = e[0];
      }
    }
    e = a;
    if ("variables" == b.menuName) {
      var g = Entry.variableContainer.variables_, h;
      for (h in g) {
        var k = g[h];
        if (k.id_ == a) {
          e = k.name_;
          break;
        }
      }
    } else {
      if ("lists" == b.menuName) {
        for (h in g = Entry.variableContainer.lists, g) {
          if (k = g[h], k.id_ == a) {
            e = k.name_;
            break;
          }
        }
      } else {
        if ("pictures" == b.menuName) {
          for (g in h = Entry.container.getAllObjects(), h) {
            for (k in c = h[g], c = c.pictures, c) {
              if (f = c[k], f.id == a) {
                return e = f.name;
              }
            }
          }
        } else {
          if ("sounds" == b.menuName) {
            for (g in h = Entry.container.getAllObjects(), h) {
              for (k in c = h[g], c = c.sounds, c) {
                if (f = c[k], f.id == a) {
                  return e = f.name;
                }
              }
            }
          }
        }
      }
    }
    return e;
  };
  b.binaryOperatorValueConvertor = function(a) {
    switch(a) {
      case "EQUAL":
        a = "==";
        break;
      case "GREATER":
        a = ">";
        break;
      case "LESS":
        a = "<";
        break;
      case "GREATER_OR_EQUAL":
        a = ">=";
        break;
      case "LESS_OR_EQUAL":
        a = "<=";
        break;
      case "\uadf8\ub9ac\uace0":
        a = "&&";
        break;
      case "\ub610\ub294":
        a = "||";
        break;
      case "PLUS":
        a = "+";
        break;
      case "MINUS":
        a = "-";
        break;
      case "MULTI":
        a = "*";
        break;
      case "DIVIDE":
        a = "/";
        break;
    }
    return a;
  };
  b.variableFilter = function(a, b, c) {
    var e = c;
    a = a.data.type;
    "change_variable" == a || "set_variable" == a || "get_variable" == a ? 1 == b && (e = eval(c)) : "length_of_list" == a || "is_included_in_list" == a ? 2 == b && (e = eval(c)) : "value_of_index_from_list" == a ? 2 == b ? e = eval(c) : 4 == b && this.isNumeric(c) && (e = c - 1) : "remove_value_from_list" == a ? 2 == b ? e = eval(c) : 1 == b && this.isNumeric(c) && (e = c - 1) : "insert_value_to_list" == a ? 2 == b ? e = eval(c) : 3 == b && this.isNumeric(c) && (e = c - 1) : "change_value_list_index" == 
    a ? 1 == b ? e = eval(c) : 2 == b && this.isNumeric(c) && (e = c - 1) : "add_value_to_list" == a && 2 == b && (e = eval(c));
    return e;
  };
  b.isGlobalVariableExisted = function(a) {
    var b = Entry.variableContainer.variables_, c;
    for (c in b) {
      var e = b[c];
      if (null === e.object_ && e.name_ == a) {
        return !0;
      }
    }
    return !1;
  };
  b.updateGlobalVariable = function(a, b) {
    var c = Entry.variableContainer.variables_, e;
    for (e in c) {
      var f = c[e];
      if (null === f.object_ && f.name_ == a) {
        variable = {x:f.x_, y:f.y_, id:f.id_, visible:f.visible_, value:b, name:a, isCloud:f.isClud_};
        f.syncModel_(variable);
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  b.createGlobalVariable = function(a, b) {
    this.isGlobalVariableExisted(a) || (Entry.variableContainer.addVariable({name:a, value:b, variableType:"variable"}), Entry.variableContainer.updateList());
  };
  b.isLocalVariableExisted = function(a, b) {
    var c = Entry.variableContainer.variables_, e;
    for (e in c) {
      var f = c[e];
      if (f.object_ === b.id && f.name_ == a) {
        return !0;
      }
    }
    return !1;
  };
  b.updateLocalVariable = function(a, b, c) {
    var e = Entry.variableContainer.variables_, f;
    for (f in e) {
      var g = e[f];
      if (g.object_ === c.id && g.name_ == a) {
        g.syncModel_({x:g.x_, y:g.y_, id:g.id_, visible:g.visible_, value:b, name:a, isCloud:g.isClud_});
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  b.createLocalVariable = function(a, b, c) {
    this.isLocalVariableExisted(a, c) || (Entry.variableContainer.addVariable({name:a, value:b, object:c.id, variableType:"variable"}), Entry.variableContainer.updateList());
  };
  b.isLocalVariable = function(a) {
    var b = Entry.playground.object, c = Entry.variableContainer.variables_, e;
    for (e in c) {
      var f = c[e];
      if (f.object_ == b.id && f.id_ == a) {
        return !0;
      }
    }
    return !1;
  };
  b.isGlobalListExisted = function(a) {
    var b = Entry.variableContainer.lists_, c;
    for (c in b) {
      var e = b[c];
      if (null === e.object_ && e.name_ == a) {
        return !0;
      }
    }
    return !1;
  };
  b.updateGlobalList = function(a, b) {
    var c = Entry.variableContainer.lists_, e;
    for (e in c) {
      var f = c[e];
      if (null === f.object_ && f.name_ == a) {
        list = {x:f.x_, y:f.y_, id:f.id_, visible:f.visible_, name:a, isCloud:f.isClud_, width:f.width_, height:f.height_, array:b};
        f.syncModel_(list);
        f.updateView();
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  b.createGlobalList = function(a, b) {
    this.isGlobalListExisted(a) || (Entry.variableContainer.addList({name:a, array:b, variableType:"list"}), Entry.variableContainer.updateList());
  };
  b.isLocalListExisted = function(a, b) {
    var c = Entry.variableContainer.lists_, e;
    for (e in c) {
      var f = c[e];
      if (f.object_ === b.id && f.name_ == a) {
        return !0;
      }
    }
    return !1;
  };
  b.updateLocalList = function(a, b, c) {
    var e = Entry.variableContainer.lists_, f;
    for (f in e) {
      var g = e[f];
      if (g.object_ === c.id && g.name_ == a) {
        g.syncModel_({x:g.x_, y:g.y_, id:g.id_, visible:g.visible_, name:a, isCloud:g.isClud_, width:g.width_, height:g.height_, array:b});
        g.updateView();
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  b.createLocalList = function(a, b, c) {
    this.isLocalListExisted(a, c) || (Entry.variableContainer.addList({name:a, array:b, object:c.id, variableType:"list"}), Entry.variableContainer.updateList());
  };
  b.isLocalList = function(a) {
    var b = Entry.playground.object, c = Entry.variableContainer.lists_, e;
    for (e in c) {
      var f = c[e];
      if (f.object_ == b.id && f.id_ == a) {
        return !0;
      }
    }
    return !1;
  };
  b.isLocalType = function(a, b) {
    if ("get_variable" == a.data.type || "set_variable" == a.data.type || "change_variable" == a.data.type) {
      if (this.isLocalVariable(b)) {
        return !0;
      }
    } else {
      if (("value_of_index_from_list" == a.data.type || "add_value_to_list" == a.data.type || "remove_value_from_list" == a.data.type || "insert_value_to_list" == a.data.type || "change_value_list_index" == a.data.type || "length_of_list" == a.data.type || "is_included_in_list" == a.data.type) && this.isLocalList(b)) {
        return !0;
      }
    }
  };
  b.isEventBlock = function(a) {
    a = a.data.type;
    return "when_run_button_click" == a || "when_some_key_pressed" == a || "mouse_clicked" == a || "mouse_click_cancled" == a || "when_object_click" == a || "when_object_click_canceled" == a || "when_message_cast" == a || "when_scene_start" == a || "when_clone_start" == a ? !0 : !1;
  };
  b.makeDefinition = function(a) {
    var b = /(%.)/mi;
    a = Entry.block[a.data.type].syntax.py[0].split(b);
    for (var c = "", e = 0;e < a.length;e++) {
      var f = a[e], c = b.test(f) ? c + "event" : c + f
    }
    return c;
  };
  b.isNoPrintBlock = function(a) {
    return !1;
  };
  b.entryEventFuncFilter = function(a) {
    var b = !1;
    a = a.split("\n");
    for (var c in a) {
      var e = a[c];
      "def entry_event_start():" == e || "def entry_event_mouse_down():" == e || "def entry_event_mouse_up():" == e || "def entry_event_object_down():" == e || "def entry_event_scene_start():" == e || "def entry_event_clone_create():" == e ? (tokens = e.split("def"), e = tokens[1].substring(0, tokens[1].length - 1).trim() + "\n", a[c] = e, b = !0) : (new RegExp(/^def entry_event_key(.+):$/)).test(e) || (new RegExp(/^def entry_event_signal(.+):$/)).test(e) ? (tokens = e.split("def"), e = tokens[1].substring(0, 
      tokens[1].length - 1).trim() + "\n", a[c] = e, b = !0) : b && (e = a[c], e = e.replace("\t", ""), a[c] = e);
    }
    return a.join("\n");
  };
  b.eventBlockSyntaxFilter = function(a) {
    return "entry_event_start" == a || "entry_event_key" == a || "entry_event_mouse_down" == a || "entry_event_mouse_up" == a || "entry_event_object_down" == a || "entry_event_signal" == a || "entry_event_scene_start" == a || "entry_event_clone_create" == a ? "def " + a : a;
  };
  b.isEntryEventFunc = function(a) {
    return "def entry_event_start" == a || "def entry_event_key" == a || "def entry_event_mouse_down" == a || "def entry_event_mouse_up" == a || "def entry_event_object_down" == a || "def entry_event_signal" == a || "def entry_event_scene_start" == a || "def entry_event_clone_create" == a ? !0 : !1;
  };
  b.searchFuncDefParam = function(a) {
    "function_field_label" == a.data.type && this._funcNameQ.enqueue(a.data.params[0]);
    return a && a.data && a.data.params && a.data.params[1] ? ("function_field_string" != a.data.type && "function_field_boolean" != a.data.type || this._funcParamQ.enqueue(a.data.params[0].data.type), this.searchFuncDefParam(a.data.params[1])) : a;
  };
  b.gatherFuncDefParam = function(a) {
    if (a && a.data) {
      if (a.data.params[0]) {
        if (a.data.params[0].data) {
          var b = a.data.params[0].data.type;
          "function_field_string" != a.data.type && "function_field_boolean" != a.data.type || this._funcParamQ.enqueue(b);
        } else {
          "function_field_label" == a.data.type && this._funcNameQ.enqueue(a.data.params[0]);
        }
      }
      if (a.data.params[1]) {
        var c = this.searchFuncDefParam(a.data.params[1]);
        c.data.params[0].data && (b = c.data.params[0].data.type, "function_field_string" != c.data.type && "function_field_boolean" != c.data.type || this._funcParamQ.enqueue(b));
        c.data.params[1] && c.data.params[1].data.params[0].data && (b = c.data.params[1].data.params[0].data.type, "function_field_string" != c.data.params[1].data.type && "function_field_boolean" != c.data.params[1].data.type || this._funcParamQ.enqueue(b));
      }
    }
    return c;
  };
  b.getLastParam = function(a) {
    a && a.data && a.data.params[1] && (a = this.getLastParam(a.data.params[1]));
    return a;
  };
  b.isFuncContentsMatch = function(a, b, c) {
    for (var e = !0, f = 0;f < a.length && e;f++) {
      var e = !1, g = a[f], h = b[f];
      if (g && !h) {
        e = fasle;
        break;
      }
      if (!g && h) {
        e = !1;
        break;
      }
      if (h.type == g.data.type) {
        var e = !0, k = h.params, l = g.data.params, m = [];
        l.map(function(a, b) {
          a && m.push(a);
        });
        l = m;
        if (k.length == l.length) {
          for (var e = !0, n = 0;n < k.length && e;n++) {
            if (e = !1, k[n].name) {
              for (var q in textFuncParams) {
                if (k[n].name == textFuncParams[q]) {
                  for (var r in c) {
                    if (l[n].data.type == r && c[r] == q) {
                      e = !0;
                      break;
                    }
                  }
                  if (e) {
                    break;
                  }
                }
              }
            } else {
              "True" == k[n].type || "False" == k[n].type ? k[n].type == l[n].data.type && (e = !0) : k[n].type && k[n].params && k[n].params[0] == l[n].data.params[0] && (e = !0);
            }
          }
          e && h.statements && 0 != h.statements.length && (e = this.isFuncContentsMatch(g.data.statements[0]._data, h.statements[0]));
        } else {
          e = !1;
          break;
        }
      } else {
        e = !1;
        break;
      }
    }
    return e;
  };
  b.isParamBlock = function(a) {
    a = a.type;
    return "ai_boolean_distance" == a || "ai_distance_value" == a || "ai_boolean_object" == a || "ai_boolean_and" == a ? !0 : !1;
  };
  b.hasBlockInfo = function(a, b) {
    var c = !1, e;
    for (e in b) {
      var f = b[e];
      if (e == a.type) {
        for (var g in f) {
          var h = f[g];
          if (h.start == a.start && h.end == a.end) {
            c = !0;
            break;
          }
        }
      }
    }
    return c;
  };
  b.updateBlockInfo = function(a, b) {
    var c = b[a.type];
    if (c && Array.isArray(c) && 0 != c.legnth) {
      for (var e in c) {
        var f = c[e];
        if (f.start == a.start && f.end == a.end) {
          break;
        } else {
          f = {}, f.start = a.start, f.end = a.end, c.push(f);
        }
      }
    } else {
      b[a.type] = [], f = {}, f.start = a.start, f.end = a.end, b[a.type].push(f);
    }
  };
  b.jsAdjustSyntax = function(a, b) {
    var c = "";
    if ("ai_boolean_distance" == a.data.type) {
      var e = b.split(" "), c = e[0].split("_");
      c[1] = c[1].substring(1, c[1].length - 1);
      c[1] = c[1].toLowerCase();
      var c = c.join("_"), f = e[1], f = this.bTojBinaryOperatorConvertor(f), e = e[2], c = c + " " + f + " " + e;
    } else {
      "ai_boolean_object" == a.data.type ? (e = b.split(" "), c = e[0].split("_"), c[1] = c[1].substring(1, c[1].length - 1), c[1] = c[1].toLowerCase(), c = c.join("_"), f = e[1], e = e[2], c = c + " " + f + " " + e) : "ai_distance_value" == a.data.type ? (e = b.split(" "), c = e[0].split("_"), c[1] = c[1].substring(1, c[1].length - 1), c[1] = c[1].toLowerCase(), c = c.join("_")) : c = b;
    }
    return c;
  };
  b.bTojBinaryOperatorConvertor = function(a) {
    var b;
    switch(a) {
      case "'BIGGER'":
        b = ">";
        break;
      case "'BIGGER_EQUAL'":
        b = ">=";
        break;
      case "'EQUAL'":
        b = "==";
        break;
      case "'SMALLER'":
        b = "<";
        break;
      case "'SMALLER_EQUAL'":
        b = "<=";
    }
    return b;
  };
  b.jTobBinaryOperatorConvertor = function(a) {
    var b;
    switch(a) {
      case ">":
        b = "BIGGER";
        break;
      case ">=":
        b = "BIGGER_EQUAL";
        break;
      case "==":
        b = "EQUAL";
        break;
      case "<":
        b = "SMALLER";
        break;
      case "<=":
        b = "SMALLER_EQUAL";
    }
    return b;
  };
  b.radarVariableConvertor = function(a) {
    return a.split("_")[1].toUpperCase();
  };
  b.tTobDropdownValueConvertor = function(a) {
    return "stone" == a ? "OBSTACLE" : "wall" == a ? a.toUpperCase() : "item" == a ? a.toUpperCase() : a;
  };
})(Entry.TextCodingUtil.prototype);
Entry.BlockToJsParser = function(b) {
  this.syntax = b;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(b) {
  b.Code = function(a, b) {
    this._parseMode = b;
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    for (var c = "", e = a._data, f = 0;f < e.length;f++) {
      c += this.Thread(e[f]);
    }
    return c.trim();
  };
  b.Thread = function(a) {
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getBlocks();
    for (var c = 0;c < a.length;c++) {
      var e = a[c];
      c != a.length - 1 ? (e = this.Block(e), this._parseMode == Entry.Parser.PARSE_GENERAL ? b += e + "\n" : this._parseMode == Entry.Parser.PARSE_SYNTAX && (b = e + "\n")) : (e = this.Block(e), this._parseMode == Entry.Parser.PARSE_GENERAL ? b += e : this._parseMode == Entry.Parser.PARSE_SYNTAX && (b = e));
    }
    return b + "\n";
  };
  b.Block = function(a) {
    var b = a._schema.syntax.js ? a._schema.syntax.js : a._schema.syntax;
    return b ? a = this[b[0]](a) : "";
  };
  b.Program = function(a) {
    return "";
  };
  b.Scope = function(a) {
    var b = !1, c = "", e = /(%.)/mi;
    if (a._schema.syntax.js) {
      var f = a._schema.syntax.js.concat(), b = !0
    } else {
      f = a._schema.syntax.concat();
    }
    f.shift();
    for (var f = f[0].split(e), g = a._schema.params, h = a.data.params, k = 0;k < f.length;k++) {
      var l = f[k];
      0 !== l.length && "Scope" !== l && ("Judge" === l ? b = !0 : e.test(l) ? (l = l.split("%")[1], l = parseInt(l) - 1, g[l] && "Image" != g[l].type && ("Block" == g[l].type ? (l = this.Block(h[l]), c += l) : c += this[g[l].type](h[l], g[l]))) : c += l);
    }
    "#" == c.charAt(c.length - 1) && (b = !0, c = c.substring(0, c.length - 1), c = c.trim());
    b || (c += "();");
    return c = Entry.TextCodingUtil.prototype.jsAdjustSyntax(a, c);
  };
  b.BasicFunction = function(a) {
    a = this.Thread(a.statements[0]);
    return "function promise() {\n" + this.indent(a).trim() + "}";
  };
  b.BasicIteration = function(a) {
    var b = a.params[0], c = this.publishIterateVariable();
    a = this.Thread(a.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + c + " = 0; " + c + " < " + b + "; " + c + "++) {\n" + this.indent(a) + "}";
  };
  b.BasicIf = function(a) {
    if (2 == a.data.statements.length) {
      var b = this.Thread(a.statements[0]), c = this.Thread(a.statements[1]), e = a._schema.syntax.concat(), e = (a = a.data.params[0]) && "True" == a.data.type ? e[1] : void 0 === a ? e[1] : this.Block(a), b = "if (" + e + ") {\n" + this.indent(b) + "}\nelse {\n" + this.indent(c) + "}\n"
    } else {
      b = this.Thread(a.statements[0]), e = a._schema.syntax.concat(), e = (a = a.data.params[0]) && "True" == a.data.type ? e[1] : void 0 === a ? e[1] : this.Block(a), b = "if (" + e + ") {\n" + this.indent(b) + "}\n";
    }
    return b;
  };
  b.BasicWhile = function(a) {
    var b = this.Thread(a.statements[0]);
    return "while (" + a._schema.syntax.concat()[1] + ") {\n" + this.indent(b) + "}\n";
  };
  b.indent = function(a) {
    var b = "";
    a = a.split("\n");
    for (var c in a) {
      var e = a[c];
      0 != e.length && (b += "\t" + e + "\n");
    }
    return b;
  };
  b.publishIterateVariable = function() {
    var a = "", b = this._iterVariableCount;
    do {
      a = this._iterVariableChunk[b % 3] + a, b = parseInt(b / 3) - 1, 0 === b && (a = this._iterVariableChunk[0] + a);
    } while (0 < b);
    this._iterVariableCount++;
    return a;
  };
  b.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
  b.Dropdown = function(a) {
    "OBSTACLE" == a ? a = "stone" : "ITEM" == a ? a = a.toLowerCase() : "WALL" == a && (a = a.toLowerCase());
    return "'" + a + "'";
  };
  b.TextInput = function(a) {
    return a;
  };
  b.DropdownDynamic = function(a, b) {
    return a = "null" == a ? "none" : Entry.TextCodingUtil.prototype.dropdownDynamicValueConvertor(a, b);
  };
})(Entry.BlockToJsParser.prototype);
Entry.BlockToPyParser = function(b) {
  this.blockSyntax = b;
  this._variableMap = new Entry.Map;
  this._funcMap = new Entry.Map;
  this._queue = new Entry.Queue;
};
(function(b) {
  b.Code = function(a, b) {
    this._parseMode = b;
    if (a instanceof Entry.Thread) {
      return this.Thread(a);
    }
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    for (var c = "", e = a.getThreads(), f = 0;f < e.length;f++) {
      c += this.Thread(e[f]) + "\n";
    }
    return c = c.trim();
  };
  b.Thread = function(a) {
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getBlocks();
    for (var c = !1, e = "", f = "", g = 0;g < a.length;g++) {
      var h = a[g];
      if (this._parseMode == Entry.Parser.PARSE_GENERAL) {
        if (Entry.TextCodingUtil.prototype.isNoPrintBlock(h)) {
          continue;
        }
        0 == g ? (c = Entry.TextCodingUtil.prototype.isEventBlock(h)) ? e = this.Block(h) + "\n" : f += this.Block(h) + "\n" : 0 != g && (f += this.Block(h) + "\n");
      } else {
        this._parseMode == Entry.Parser.PARSE_SYNTAX && (b = (c = Entry.TextCodingUtil.prototype.isEventBlock(h)) ? "" : this.Block(h) + "\n");
      }
      this._queue.clear();
      this._variableMap.clear();
    }
    this._parseMode == Entry.Parser.PARSE_GENERAL && (b = c ? e + Entry.TextCodingUtil.prototype.indent(f) + "\n" : e + f + "\n");
    return b = b.trim() + "\n";
  };
  b.Block = function(a) {
    var b = "", c;
    a._schema && a._schema.syntax && (c = a._schema.syntax.py[0]);
    this.isFunc(a) ? (b += this.makeFuncDef(a), this.isRegisteredFunc(a) && (c = this.makeFuncSyntax(a))) : this.isFuncStmtParam(a) && (b += a.data.type);
    if (!c || null == c) {
      return b;
    }
    var e = /(%.)/mi, f = /(\$.)/mi;
    c = c.split(e);
    var g = a._schema.params, h = a.data.params, k = a._schema.skeleton, l = a._schema.paramsKeyMap, m = "";
    if (this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && l) {
      var n = 0
    }
    for (var q = 0;q < c.length;q++) {
      if (n = c[q], 0 !== n.length) {
        if (e.test(n)) {
          var n = n.split("%")[1], r = Number(n) - 1;
          if (g[r] && "Indicator" != g[r].type) {
            if ("Block" == g[r].type) {
              if (m = this.Block(h[r]).trim(), r = this._funcMap.get(m)) {
                b += r;
              } else {
                var r = m.split("_"), t = r[0];
                2 == r.length && ("stringParam" == t ? m = "string_param" : "booleanParam" == t && (m = "boolean_param"));
                m = Entry.TextCodingUtil.prototype.variableFilter(a, n, m);
                b += m;
                this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && l && (r = Object.keys(l), n = String(r[n++]), n = n.toLowerCase(), this._variableMap.put(n, m), this._queue.enqueue(n));
              }
            } else {
              m = this["Field" + g[r].type](h[r], g[r]), null == m && (m = g[r].text ? g[r].text : null), m = Entry.TextCodingUtil.prototype.binaryOperatorValueConvertor(m), m = String(m), Entry.TextCodingUtil.prototype.isNumeric(m) || Entry.TextCodingUtil.prototype.isBinaryOperator(m) || (m = String('"' + m + '"')), m = Entry.TextCodingUtil.prototype.variableFilter(a, n, m), Entry.TextCodingUtil.prototype.isLocalType(a, h[r]) && (m = "self".concat(".").concat(m)), b += m, this._parseMode == Entry.Parser.PARSE_VARIABLE && 
              k == Entry.Parser.BLOCK_SKELETON_BASIC && l && (r = Object.keys(l), n = String(r[n++]), n = n.toLowerCase(), this._variableMap.put(n, m), this._queue.enqueue(n));
            }
          }
        } else {
          if (f.test(n)) {
            for (n = n.split(f), m = 0;m < n.length;m++) {
              r = n[m], 0 !== r.length && (f.test(r) ? (r = Number(r.split("$")[1]) - 1, b += Entry.TextCodingUtil.prototype.indent(this.Thread(a.statements[r]))) : b += r);
            }
          } else {
            m = 0, n.search("#"), -1 != n.search("#") && (m = n.indexOf("#"), n = n.substring(m + 1)), b += n;
          }
        }
      }
    }
    this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && l && (a = Object.keys(l).length) && (b = this.makeExpressionWithVariable(b, a));
    return b;
  };
  b.FieldAngle = function(a) {
    return a;
  };
  b.FieldColor = function(a) {
    return a;
  };
  b.FieldDropdown = function(a) {
    return a;
  };
  b.FieldDropdownDynamic = function(a, b) {
    console.log("FieldDropdownDynamic", a, b);
    console.log("FieldDropdownDynamic Object", Entry.playground.object);
    return a = "null" == a ? "None" : Entry.TextCodingUtil.prototype.dropdownDynamicValueConvertor(a, b);
  };
  b.FieldImage = function(a) {
    return a;
  };
  b.FieldIndicator = function(a) {
    return a;
  };
  b.FieldKeyboard = function(a) {
    return a;
  };
  b.FieldOutput = function(a) {
    return a;
  };
  b.FieldText = function(a) {
    return a;
  };
  b.FieldTextInput = function(a) {
    return a;
  };
  b.FieldNumber = function(a) {
    return a;
  };
  b.FieldKeyboard = function(a) {
    (a = Entry.KeyboardCode.prototype.keyCodeToChar[a]) && null != a || (a = "Q");
    return a;
  };
  b.getBlockType = function(a) {
    return this.blockSyntax[a];
  };
  b.makeExpressionWithVariable = function(a, b) {
    var c, e = c = "", f = 0, g = a.indexOf("(");
    c = a.substring(0, g).trim().concat("(");
    if (this._queue.toString()) {
      for (;(variable = this._queue.dequeue()) && !(g = this._variableMap.get(variable), g = variable.concat(" = ").concat(g).concat("\n"), e += g, c = c.concat(variable).concat(",").concat(" "), f++, 10 < f);) {
      }
      g = c.lastIndexOf(",");
      c = c.substring(0, g);
      c = c.trim().concat(")");
      c = e.concat(c);
    } else {
      c = a;
    }
    return c;
  };
  b.isFunc = function(a) {
    return "func" == a.data.type.split("_")[0] ? !0 : !1;
  };
  b.isRegisteredFunc = function(a) {
    a = a.data.type.split("_")[1];
    return Entry.variableContainer.functions_[a] ? !0 : !1;
  };
  b.isFuncStmtParam = function(a) {
    a = a.data.type.split("_")[0];
    return "stringParam" == a || "booleanParam" == a ? !0 : !1;
  };
  b.makeFuncSyntax = function(a) {
    var b = "", c = a._schema.template.trim();
    a = a._schema.params;
    var b = /(%.)/mi, c = c.trim().split(b), e = "", f = "", g;
    for (g in c) {
      var h = c[g].trim();
      if (b.test(h)) {
        var k = h.split("%")[1], k = Number(k) - 1;
        "Indicator" != a[k].type && (f += h.concat(", "));
      } else {
        h = h.split(" "), e += h.join("__");
      }
    }
    k = f.lastIndexOf(",");
    f = f.substring(0, k);
    return b = e.trim().concat("(").concat(f.trim()).concat(")");
  };
  b.makeFuncDef = function(a) {
    var b = "def ", c = this.getFuncInfo(a);
    this.isRegisteredFunc(a) || (c.name = "f");
    if (c.name) {
      b += c.name;
    } else {
      return b;
    }
    b = b.concat("(");
    if (c.params && 0 != c.params.length) {
      for (var e in c.params) {
        b += c.params[e], b = b.concat(", ");
      }
      a = b.lastIndexOf(",");
      b = b.substring(0, a);
      b = b.trim();
    }
    b = b.concat("):").concat("\n");
    if (c.statements && c.statements.length) {
      a = "";
      for (var f in c.statements) {
        a += this.Block(c.statements[f]).concat("\n");
      }
      a = a.concat("\n");
      b += Entry.TextCodingUtil.prototype.indent(a).concat("\n");
    }
    this._funcMap.clear();
    return b;
  };
  b.getFuncInfo = function(a) {
    var b = {};
    if (a = a.data.type.split("_")[1]) {
      var c = Entry.variableContainer.functions_[a];
      if (!c) {
        return b.name = "\ud568\uc218", b;
      }
    } else {
      return b;
    }
    a = c.block.template;
    var e = a.search(/(%.)/);
    a = a.substring(0, e).trim().split(" ").join("__");
    Entry.TextCodingUtil.prototype.initQueue();
    Entry.TextCodingUtil.prototype.gatherFuncDefParam(c.content._data[0]._data[0].data.params[0]);
    for (var f = [], g = {};m = Entry.TextCodingUtil.prototype._funcParamQ.dequeue();) {
      f.push(m);
    }
    for (var h in f) {
      g[f[h]] = h;
    }
    Entry.TextCodingUtil.prototype.clearQueue();
    if (g) {
      var f = {}, k;
      for (k in g) {
        e = g[k];
        h = k.search("_");
        h = k.substring(0, h);
        if ("stringParam" == h) {
          var l = "value" + String(e + 1)
        } else {
          "booleanParam" == h && (l = "boolean" + String(e + 1));
        }
        var m = l;
        f[e] = m;
        this._funcMap.put(k, m);
      }
    }
    k = c.content._data[0]._data;
    l = [];
    for (c = 1;c < k.length;c++) {
      l.push(k[c]);
    }
    a && (b.name = a);
    0 != Object.keys(f).length && (b.params = f);
    0 != l.length && (b.statements = l);
    return b;
  };
})(Entry.BlockToPyParser.prototype);
Entry.JsToBlockParser = function(b) {
  this.syntax = b;
  this.scopeChain = [];
  this.scope = null;
  this._blockCount = 0;
  this._blockInfo = {};
};
(function(b) {
  b.Program = function(a) {
    var b = [], c = [];
    c.push({type:this.syntax.Program});
    for (var e in a) {
      var f = a[e];
      if ("Program" != f.type) {
        return;
      }
      this.initScope(f);
      var f = this.BlockStatement(f), g;
      for (g in f) {
        c.push(f[g]);
      }
      this.unloadScope();
      0 != c.length && b.push(c);
    }
    return b;
  };
  b.Identifier = function(a) {
    return a.name;
  };
  b.Literal = function(a, b) {
    return !0 === a.value ? {type:"True"} : !1 === a.value ? {type:"False"} : "ai_distance_value" == b ? a.value : "ai_boolean_object" == b ? a.value : {type:"text", params:[a.value]};
  };
  b.ExpressionStatement = function(a) {
    a = a.expression;
    return this[a.type](a);
  };
  b.ForStatement = function(a) {
    var b = a.init, c = a.test, e = a.update, f = a.body;
    if (this.syntax.ForStatement) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    var f = this[f.type](f), b = b.declarations[0].init.value, g = c.operator, c = c.right.value, h = 0;
    "++" != e.operator && (e = b, b = c, c = e);
    switch(g) {
      case "<":
        h = c - b;
        break;
      case "<=":
        h = c + 1 - b;
        break;
      case ">":
        h = b - c;
        break;
      case ">=":
        h = b + 1 - c;
    }
    return this.BasicIteration(a, h, f);
  };
  b.BlockStatement = function(a) {
    var b = [];
    a = a.body;
    for (var c = 0;c < a.length;c++) {
      var e = a[c], f = this[e.type](e);
      Entry.TextCodingUtil.prototype.hasBlockInfo(e, this._blockInfo) || this._blockCount++;
      Entry.TextCodingUtil.prototype.updateBlockInfo(e, this._blockInfo);
      if (f) {
        if (void 0 === f.type) {
          throw {title:"\ube14\ub85d\ubcc0\ud658 \uc624\ub958", message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ube14\ub85d\uc785\ub2c8\ub2e4.", node:e, blockCount:this._blockCount};
        }
        Entry.TextCodingUtil.prototype.isParamBlock(f) || f && b.push(f);
      }
    }
    return b;
  };
  b.EmptyStatement = function(a) {
    throw {message:"empty\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.DebuggerStatement = function(a) {
    throw {message:"debugger\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WithStatement = function(a) {
    throw {message:"with\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ReturnStaement = function(a) {
    throw {message:"return\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.LabeledStatement = function(a) {
    throw {message:"label\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.BreakStatement = function(a) {
    throw {message:"break\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ContinueStatement = function(a) {
    throw {message:"continue\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.IfStatement = function(a) {
    if (this.syntax.BasicIf) {
      return this.BasicIf(a);
    }
    throw {message:"if\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SwitchStatement = function(a) {
    throw {message:"switch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SwitchCase = function(a) {
    throw {message:"switch ~ case\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThrowStatement = function(a) {
    throw {message:"throw\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.TryStatement = function(a) {
    throw {message:"try\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CatchClause = function(a) {
    throw {message:"catch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WhileStatement = function(a) {
    var b = a.body, c = this.syntax.WhileStatement, b = this[b.type](b);
    if (c) {
      throw {message:"while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return this.BasicWhile(a, b);
  };
  b.DoWhileStatement = function(a) {
    throw {message:"do ~ while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ForInStatement = function(a) {
    throw {message:"for ~ in\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionDeclaration = function(a) {
    if (this.syntax.FunctionDeclaration) {
      throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return null;
  };
  b.VariableDeclaration = function(a) {
    throw {message:"var\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThisExpression = function(a) {
    return this.scope.this;
  };
  b.ArrayExpression = function(a) {
    throw {message:"array\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ObjectExpression = function(a) {
    throw {message:"object\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.Property = function(a) {
    throw {message:"init, get, set\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionExpression = function(a) {
    throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryOperator = function() {
    return "- + ! ~ typeof void delete".split(" ");
  };
  b.updateOperator = function() {
    return ["++", "--"];
  };
  b.BinaryOperator = function() {
    return "== != === !== < <= > >= << >> >>> + - * / % , ^ & in instanceof".split(" ");
  };
  b.AssignmentExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.AssignmentOperator = function() {
    return "= += -= *= /= %= <<= >>= >>>= ,= ^= &=".split(" ");
  };
  b.BinaryExpression = function(a) {
    var b = {}, c = {}, b = String(a.operator), e = a.left.name;
    switch(b) {
      case "==":
        var f = "object_up" == e || "object_right" == e || "object_down" == e ? "ai_boolean_object" : "radar_up" == e || "radar_right" == e || "radar_down" == e ? "ai_boolean_distance" : null;
        break;
      case "<":
        f = "ai_boolean_distance";
        break;
      case "<=":
        f = "ai_boolean_distance";
        break;
      case ">":
        f = "ai_boolean_distance";
        break;
      case ">=":
        f = "ai_boolean_distance";
    }
    if (f) {
      e = [];
      b = a.left;
      if ("Literal" == b.type || "Identifier" == b.type) {
        arguments = [];
        arguments.push(b);
        var b = Entry.block[f].params, g;
        for (g in b) {
          var h = b[g].type;
          "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
        }
        for (var k in arguments) {
          b = arguments[k], h = this[b.type](b), (h = Entry.TextCodingUtil.prototype.radarVariableConvertor(h)) && null != h && e.push(h);
        }
      } else {
        h = this[b.type](b), (h = Entry.TextCodingUtil.prototype.radarVariableConvertor(h)) && e.push(h);
      }
      if (b = String(a.operator)) {
        (h = b = Entry.TextCodingUtil.prototype.jTobBinaryOperatorConvertor(b)) && e.push(h), c.operator = b;
      }
      b = a.right;
      if ("Literal" == b.type || "Identifier" == b.type) {
        arguments = [];
        arguments.push(b);
        b = Entry.block[f].params;
        for (g in b) {
          h = b[g].type, "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
        }
        for (k in arguments) {
          if (b = arguments[k], h = this[b.type](b), "string" == typeof h && (g = h.split("_"), "radar" == g[0] && (b = {type:"ai_distance_value", params:[]}, b.params.push(g[1].toUpperCase()), h = b)), h && null != h && ("ai_boolean_object" == f && (h = h.params[0], e.splice(1, 1)), h = Entry.TextCodingUtil.prototype.tTobDropdownValueConvertor(h), e.push(h), console.log("rigth param", e), e[2] && "text" != e[2].type && "ai_distance_value" != e[2].type)) {
            throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
          }
        }
      } else {
        h = this[b.type](b), "ai_boolean_object" == f && (h = h.params[0], e.splice(1, 1)), h && e.push(h);
      }
      c.type = f;
      c.params = e;
    } else {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
    }
    return c;
  };
  b.LogicalExpression = function(a) {
    var b = {}, c = String(a.operator);
    switch(c) {
      case "&&":
        var e = "ai_boolean_and";
        break;
      default:
        e = "ai_boolean_and";
    }
    var f = [], c = a.left;
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      var c = Entry.block[e].params, g;
      for (g in c) {
        var h = c[g].type;
        "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
      }
      for (var k in arguments) {
        c = arguments[k], (c = this[c.type](c)) && null != c && f.push(c);
      }
    } else {
      (c = this[c.type](c)) && f.push(c);
    }
    if (c = String(a.operator)) {
      c = Entry.TextCodingUtil.prototype.logicalExpressionConvert(c), f.push(c);
    }
    c = a.right;
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      c = Entry.block[e].params;
      for (g in c) {
        h = c[g].type, "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
      }
      for (k in arguments) {
        c = arguments[k], (c = this[c.type](c)) && null != c && f.push(c);
      }
      if ("True" != f[0].type && "ai_boolean_distance" != f[0].type && "ai_boolean_object" != f[0].type && "ai_boolean_and" != f[0].type && "ai_distance_value" != f[0].type) {
        throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
      }
      if ("True" != f[2].type && "ai_boolean_distance" != f[2].type && "ai_boolean_object" != f[2].type && "ai_boolean_and" != f[2].type && "ai_distance_value" != f[2].type) {
        throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
      }
    } else {
      (c = this[c.type](c)) && f.push(c);
    }
    b.type = e;
    b.params = f;
    return b;
  };
  b.LogicalOperator = function() {
    return ["||", "&&"];
  };
  b.MemberExpression = function(a) {
    var b = a.object, c = a.property, b = this[b.type](b), c = this[c.type](c, b);
    if (Object(b) !== b || Object.getPrototypeOf(b) !== Object.prototype) {
      throw {message:b + "\uc740(\ub294) \uc798\ubabb\ub41c \uba64\ubc84 \ubcc0\uc218\uc785\ub2c8\ub2e4.", node:a};
    }
    b = c;
    if (!b) {
      throw {message:c + "\uc774(\uac00) \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.", node:a};
    }
    return b;
  };
  b.ConditionalExpression = function(a) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UpdateExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CallExpression = function(a) {
    var b = a.callee;
    a = a.arguments;
    for (var c = [], b = this[b.type](b), b = this.syntax.Scope[b], e = Entry.block[b], f = 0;f < a.length;f++) {
      var g = a[f], g = this[g.type](g, b);
      "Dropdown" != e.params[f].type && "Block" === e.params[f].type && (g = "string" == typeof g ? {type:"text", params:[g]} : "number" == typeof g ? {type:"number", params:[g]} : g);
      c.push(g);
    }
    return {type:b, params:c};
  };
  b.NewExpression = function(a) {
    throw {message:"new\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SequenceExpression = function(a) {
    throw {message:"SequenceExpression \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.initScope = function(a) {
    if (null === this.scope) {
      var b = function() {
      };
      b.prototype = this.syntax.Scope;
    } else {
      b = function() {
      }, b.prototype = this.scope;
    }
    this.scope = new b;
    this.scopeChain.push(this.scope);
    return this.scanDefinition(a);
  };
  b.unloadScope = function() {
    this.scopeChain.pop();
    this.scope = this.scopeChain.length ? this.scopeChain[this.scopeChain.length - 1] : null;
  };
  b.scanDefinition = function(a) {
    a = a.body;
    for (var b = [], c = 0;c < a.length;c++) {
      var e = a[c];
      "FunctionDeclaration" === e.type && (this.scope[e.id.name] = this.scope.promise, this.syntax.BasicFunction && (e = e.body, b.push([{type:this.syntax.BasicFunction, statements:[this[e.type](e)]}])));
    }
    return b;
  };
  b.BasicFunction = function(a, b) {
    return null;
  };
  b.BasicIteration = function(a, b, c) {
    if (10 < b) {
      throw {message:"\ubc18\ubcf5 \uc22b\uc790\uac12\uc774 10\uc744 \ub118\uc73c\uba74 \uc548\ub429\ub2c8\ub2e4.", node:a.test};
    }
    var e = this.syntax.BasicIteration;
    if (!e) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return {params:[b], type:e, statements:[c]};
  };
  b.BasicWhile = function(a, b) {
    var c = a.test.raw;
    if (this.syntax.BasicWhile[c]) {
      return {type:this.syntax.BasicWhile[c], statements:[b]};
    }
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
  };
  b.BasicIf = function(a) {
    var b = {params:[], statements:[]}, c, e = [], f = [], g = [], h = a.consequent;
    if (h) {
      var k = this[h.type](h)
    }
    if (h = a.alternate) {
      var l = this[h.type](h)
    }
    try {
      var m = a.test.operator ? "===" === a.test.operator ? "==" : a.test.operator : null, n = a.test.left && a.test.right ? a.test.left.name + a.test.right.value : null;
      if ("frontwall" == n && "==" == m) {
        c = this.syntax.BasicIf["front == 'wall'"];
      } else {
        if ("fronthump" == n && "==" == m) {
          c = this.syntax.BasicIf["front == 'hump'"];
        } else {
          if ("frontstone" == n && "==" == m) {
            c = this.syntax.BasicIf["front == 'stone'"];
          } else {
            if ("frontbee" == n && "==" == m) {
              c = this.syntax.BasicIf["front == 'bee'"];
            } else {
              if (a.test.value || a.test.left && a.test.right) {
                c = "ai_if_else";
                var q = this[a.test.type](a.test, this.syntax.Scope);
                g.push(q);
              } else {
                throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
              }
            }
          }
        }
      }
      c ? (k && 0 != k.length && b.statements.push(k), l && 0 != l.length && b.statements.push(l), c && (b.type = c), g && 0 != g.length && (b.params = g)) : (k && 0 != k.length && (e = k), l && 0 != l.length && (f = l), c && (b.type = c), g && 0 != g.length && (b.params = g), b.statements = [e, f]);
      return b;
    } catch (r) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
    }
  };
})(Entry.JsToBlockParser.prototype);
Entry.PyToBlockParser = function(b) {
  this.blockSyntax = b;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
  this._variableMap = new Entry.Map;
  this._funcMap = new Entry.Map;
  this._paramQ = new Entry.Queue;
};
(function(b) {
  b.Program = function(a) {
    var b = [], c;
    for (c in a) {
      if ("Program" != a[c].type) {
        return;
      }
      var e = [], f = a[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c];
        console.log("Program node", g);
        g = this[g.type](g);
        console.log("result block", g);
        g && g.type && e.push(g);
      }
      console.log("thread", e);
      0 != e.length && b.push(e);
    }
    return b;
  };
  b.ExpressionStatement = function(a) {
    console.log("ExpressionStatement component", a);
    var b = {};
    a = a.expression;
    a.type && (a = this[a.type](a), console.log("ExpressionStatement expressionData", a), a.type && a.params ? (b.type = a.type, b.params = a.params, result = b) : a.type ? (b.type = a.type, result = b) : result = a);
    console.log("ExpressionStatement result", result);
    return result;
  };
  b.CallExpression = function(a) {
    console.log("CallExpression component", a);
    var b = {}, c = [], e, f = a.callee, g = this[f.type](f);
    console.log("CallExpression calleeData", g);
    arguments = a.arguments;
    if ("Identifier" == f.type) {
      console.log("CallExpression Identifier calleeData", g), b.callee = g, t = Entry.TextCodingUtil.prototype.eventBlockSyntaxFilter(g.name), e = this.getBlockType(t);
    } else {
      var h = g.object;
      e = g.property;
      if (h.statements && "call" == e.name && 0 == e.userCode) {
        e = h.statements, console.log("CallExpression statement", e), b.statements = e;
      } else {
        var k = h.name ? String(h.name).concat(".").concat(String(e.name)) : h.object.name ? String(h.object.name).concat(".").concat(String(h.property.name)).concat(".").concat(String(e.name)) : null
      }
      console.log("CallExpression calleeName", k);
      e = this.getBlockType(k);
      console.log("CallExpression type before", e);
      if (k) {
        var l = k.split(".")
      }
      console.log("CallExpression calleeTokens", l);
      if ("__pythonRuntime.functions.range" == k) {
        var m = "%1number#";
        e = this.getBlockType(m);
      } else {
        if ("__pythonRuntime.ops.add" == k) {
          m = "(%1 %2calc_basic# %3)", e = this.getBlockType(m), f = {raw:"PLUS", type:"Literal", value:"PLUS"}, console.log("arguments geniuse", arguments), 2 == arguments.length && arguments.splice(1, 0, f), b.operator = "PLUS";
        } else {
          if ("__pythonRuntime.ops.multiply" == k) {
            m = "(%1 %2calc_basic# %3)", e = this.getBlockType(m), f = {raw:"MULTI", type:"Literal", value:"MULTI"}, 2 == arguments.length && arguments.splice(1, 0, f), b.operator = "MULTI";
          } else {
            if ("__pythonRuntime.ops.in" == k) {
              m = "%4 in %2", e = this.getBlockType(m);
            } else {
              if ("__pythonRuntime.functions.len" == k) {
                m = "len", e = this.getBlockType(m);
              } else {
                if ("Identifier" == f.object.type && "append" == l[1] || "MemberExpression" == f.object.type && "self" == l[0] && "append" == l[2]) {
                  m = "%2.append", e = this.getBlockType(m);
                } else {
                  if ("Identifier" == f.object.type && "insert" == l[1] || "MemberExpression" == f.object.type && "self" == l[0] && "insert" == l[2]) {
                    m = "%2.insert", e = this.getBlockType(m);
                  } else {
                    if ("Identifier" == f.object.type && "pop" == l[1] || "MemberExpression" == f.object.type && "self" == l[0] && "pop" == l[2]) {
                      m = "%2.pop", e = this.getBlockType(m);
                    }
                  }
                }
              }
            }
          }
        }
      }
      b.callee = k;
    }
    console.log("CallExpression type after", e);
    if (e) {
      var n = Entry.block[e], f = n.params, n = n.def.params;
      console.log("CallExpression component.arguments", arguments);
      console.log("CallExpression paramsMeta", f);
      console.log("CallExpression paramsDefMeta", n);
      for (var q in f) {
        h = f[q].type, "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, q < arguments.length && arguments.splice(q, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, q < arguments.length && arguments.splice(q, 0, h));
      }
      console.log("CallExpression arguments", arguments);
      for (var r in arguments) {
        if (q = arguments[r]) {
          console.log("CallExpression argument", q, "typeof", typeof q), q = this[q.type](q, f[r], n[r], !0), console.log("CallExpression param", q), "__pythonRuntime.functions.range" == k && q.type ? (e = q.type, c = q.params) : c.push(q);
        }
      }
      console.log("CallExpression syntax", m);
      console.log("CallExpression argument params", c);
      if ("%2.append" == m || "%2.pop" == m) {
        if ("self" == l[0]) {
          var h = Entry.playground.object, t = l[1];
          if (!Entry.TextCodingUtil.prototype.isLocalListExisted(t, h)) {
            return b;
          }
        } else {
          if (t = l[0], !Entry.TextCodingUtil.prototype.isGlobalListExisted(t)) {
            return b;
          }
        }
        console.log("CallExpression append calleeData", g);
        r = this.ParamDropdownDynamic(t, f[1], n[1]);
        console.log("CallExpression listName", r);
        c.push(r);
        console.log("CallExpression params[0]", c[0]);
        "%2.pop" == m && ("number" == c[0].type ? c[0].params[0] += 1 : "text" == c[0].type && (c[0].params[0] = String(Number(c[0].params[0]) + 1)));
      } else {
        if ("%2.insert" == m) {
          if ("self" == l[0]) {
            if (h = Entry.playground.object, t = l[1], !Entry.TextCodingUtil.prototype.isLocalListExisted(t, h)) {
              return b;
            }
          } else {
            if (t = l[0], !Entry.TextCodingUtil.prototype.isGlobalListExisted(t)) {
              return b;
            }
          }
          console.log("CallExpression insert params", c);
          c.pop();
          console.log("CallExpression append calleeData", g);
          r = this.ParamDropdownDynamic(t, f[1], n[1]);
          console.log("CallExpression listName", r);
          c.splice(0, 0, r);
          console.log("CallExpression check arguments", arguments);
          console.log("CallExpression arguments[1] 2", arguments[1]);
          q = this[arguments[1].type](arguments[1], f[2], n[2], !0);
          console.log("CallExpression check param", q);
          c.splice(0, 0, q);
          console.log("CallExpression insert params", c);
          "number" == c[2].type ? c[2].params[0] += 1 : "text" == c[2].type && (c[2].params[0] = String(Number(c[2].params[0]) + 1));
        } else {
          "len" == m ? (r = this.ParamDropdownDynamic(c[1].name, f[1], n[1]), delete c[1], c[1] = r) : "%4 in %2" == m && (q = a.arguments[1], q = this[q.type](q, f[3], n[3], !0), r = a.arguments[3].name, r = this.ParamDropdownDynamic(r, f[1], n[1]), c = [], c.push(""), c.push(r), c.push(""), c.push(q), c.push(""));
        }
      }
      e && (b.type = e);
      c && (b.params = c);
    } else {
      c = [];
      for (r in arguments) {
        q = arguments[r], console.log("CallExpression argument", q, "typeof", typeof q), f = this[q.type](q), console.log("CallExpression argumentData", f), "__pythonRuntime.utils.createParamsObj" == f.callee ? c = f.arguments : c.push(f);
      }
      console.log("CallExpression args", c);
      b.arguments = c;
    }
    console.log("CallExpression Function Check result", b);
    if (b.arguments && b.arguments[0] && "__pythonRuntime.utils.createParamsObj" == b.arguments[0].callee) {
      return b;
    }
    b.callee && (c = b.callee.name + (b.arguments ? b.arguments.length : 0), console.log("funcKey", c), e = this._funcMap.get(c)) && (b = {}, b.type = e);
    console.log("CallExpression result", b);
    return b;
  };
  b.Identifier = function(a, b, c) {
    console.log("Identifier component", a, "paramMeta", b, "paramDefMeta", c);
    b = {};
    b.name = a.name;
    if (!0 === a.userCode || !1 === a.userCode) {
      b.userCode = a.userCode;
    }
    if (c = this.getBlockType("%1")) {
      a = a.name;
      var e = Entry.block[c], f = e.params, e = e.def.params;
      if (!Entry.TextCodingUtil.prototype.isGlobalVariableExisted(a)) {
        return b;
      }
      var g = [], h, k;
      for (k in f) {
        console.log("Identifiler paramsMeta, paramsDefMeta", f[k], e[k]), "Text" != f[k].type && (h = this["Param" + f[k].type](a, f[k], e[k]));
      }
      console.log("Identifiler param", h);
      h && g.push(h);
      b.type = c;
      0 != g.length && (b.params = g);
    }
    console.log("Identifiler result", b);
    return b;
  };
  b.VariableDeclaration = function(a) {
    console.log("VariableDeclaration component", a);
    var b = {declarations:[]}, c, e;
    a = a.declarations;
    for (var f in a) {
      var g = a[f], g = this[g.type](g);
      console.log("VariableDeclaration declarationData", g);
      g && b.declarations.push(g);
      g && g.type && (c = g.type);
      g && g.params && (e = g.params);
    }
    c && (b.type = c);
    e && (b.params = e);
    console.log("VariableDeclaration result", b);
    return b;
  };
  b.VariableDeclarator = function(a) {
    console.log("VariableDeclarator component", a);
    var b = {}, c, e = [], e = a.id, f = a.init;
    if ("__params0" != e.name && "__formalsIndex0" != e.name && "__args0" != e.name) {
      if (f.callee && "__getParam0" == f.callee.name) {
        return b.name = e.name, b;
      }
      var g;
      console.log("VariableDeclarator init", f);
      if (f.callee && f.callee.object && f.callee.property) {
        if (f.callee.object.object && f.callee.object.object.name) {
          var h = f.callee.object.object.name
        }
        if (f.callee.object.property && f.callee.object.property.name) {
          var k = f.callee.object.property.name
        }
        if (f.callee.property.name) {
          var l = f.callee.property.name
        }
        h && k && l && (g = h.concat(".").concat(k).concat(".").concat(l));
      }
      if ("__pythonRuntime.objects.list" == g) {
        h = this[e.type](e);
        console.log("VariableDeclarator idData", h);
        b.id = h;
        g = this[f.type](f);
        console.log("VariableDeclarator initData", g);
        b.init = g;
        h = e.name;
        f = [];
        arguments = g.arguments;
        for (c in arguments) {
          var m = {};
          m.data = String(arguments[c].params[0]);
          f.push(m);
        }
        Entry.TextCodingUtil.prototype.isGlobalListExisted(h) ? Entry.TextCodingUtil.prototype.updateGlobalList(h, f) : Entry.TextCodingUtil.prototype.createGlobalList(h, f);
      } else {
        h = e.name;
        g = "Literal" == f.type ? f.value : "Identifier" == f.type ? f.name : NaN;
        console.log("variable name", h, "value", g);
        g && NaN != g && (h.includes("__filbert") || (Entry.TextCodingUtil.prototype.isGlobalVariableExisted(h) ? Entry.TextCodingUtil.prototype.updateGlobalVariable(h, g) : Entry.TextCodingUtil.prototype.createGlobalVariable(h, g)));
        h = this[e.type](e);
        console.log("VariableDeclarator idData", h);
        b.id = h;
        g = this[f.type](f);
        console.log("VariableDeclarator initData", g);
        b.init = g;
        console.log("VariableDeclarator init.type", f.type);
        if ("Literal" == f.type) {
          c = e = this.getBlockType("%1 = %2");
        } else {
          if (g.params && g.params[0] && g.params[0].name && h.name == g.params[0].name) {
            if (console.log("VariableDeclarator idData.name", h.name, "initData.params[0].name", g.params[0].name), c = e = this.getBlockType("%1 += %2"), "PLUS" != g.operator) {
              return b;
            }
          } else {
            c = e = this.getBlockType("%1 = %2");
          }
        }
        k = Entry.block[e];
        e = k.params;
        k = k.def.params;
        h.name && (m = this.ParamDropdownDynamic(h.name, e[0], k[0]));
        e = [];
        "Literal" == f.type ? (h.params && h.params[0] ? e.push(h.params[0]) : e.push(m), e.push(g)) : (console.log("VariableDeclarator idData", h, "initData", g), g.params && g.params[0] && h.name == g.params[0].name ? (console.log("in initData.params[0]"), h.params && h.params[0] ? e.push(h.params[0]) : e.push(m), e.push(g.params[2])) : (console.log("in initData"), h.params && h.params[0] ? e.push(h.params[0]) : e.push(m), e.push(g)));
        b.type = c;
        b.params = e;
      }
      console.log("VariableDeclarator result", b);
      return b;
    }
  };
  b.Literal = function(a, b, c, e) {
    console.log("Literal component", a, "paramMeta", b, "paramDefMeta", c, "aflag", e);
    e = a.value;
    console.log("Literal value", e);
    b || (b = {type:"Block"}, c || (c = "number" == typeof e ? {type:"number"} : {type:"text"}));
    if ("Indicator" == b.type) {
      return null;
    }
    if ("Text" == b.type) {
      return "";
    }
    console.log("Literal paramMeta", b, "paramDefMeta", c);
    null != a.value ? (b = this["Param" + b.type](e, b, c), console.log("Literal param", void 0)) : (b = [], c = this[a.left.type](a.left), b.push(c), b.push(a.operator), a = this[a.right.type](a.right), b.push(a));
    a = b;
    console.log("Literal result", a);
    return a;
  };
  b.ParamBlock = function(a, b, c) {
    console.log("ParamBlock value", a, "paramMeta", b, "paramDefMeta", c);
    b = {};
    var e = a, f = [];
    if (!0 === a) {
      return b.type = "True", b;
    }
    if (!1 === a) {
      return b.type = "False", b;
    }
    var g = Entry.block[c.type], h = g.params, g = g.def.params;
    if (h && 0 != h.length) {
      for (var k in h) {
        console.log("aaa", h[k], "bbb", g[k]), e = this["Param" + h[k].type](a, h[k], g[k]);
      }
    } else {
      e = a;
    }
    console.log("ParamBlock param", e);
    f.push(e);
    b.type = c.type;
    b.params = f;
    console.log("ParamBlock result", b);
    return b;
  };
  b.ParamAngle = function(a, b, c) {
    console.log("ParamAngle value, paramMeta, paramDefMeta", a, b, c);
    return a;
  };
  b.ParamTextInput = function(a, b, c) {
    console.log("ParamTextInput value, paramMeta, paramDefMeta", a, b, c);
    return a;
  };
  b.ParamColor = function(a, b, c) {
    console.log("ParamColor value, paramMeta, paramDefMeta", a, b, c);
    console.log("ParamColor result", a);
    return a;
  };
  b.ParamDropdown = function(a, b, c) {
    console.log("ParamDropdown value, paramMeta, paramDefMeta", a, b, c);
    var e;
    b = b.options;
    console.log("options", b);
    for (var f in b) {
      if (c = b[f], a == c[1]) {
        e = c[1];
        break;
      }
    }
    e && (e = String(e));
    console.log("ParamDropdown result", e);
    return e;
  };
  b.ParamDropdownDynamic = function(a, b, c) {
    console.log("ParamDropdownDynamic value, paramMeta, paramDefMeta", a, b, c);
    var e;
    if ("mouse" == a || "wall" == a || "wall_up" == a || "wall_down" == a || "wall_right" == a || "wall_left" == a) {
      return a;
    }
    b = b.options;
    console.log("ParamDropdownDynamic options", b);
    for (var f in b) {
      if (a == b[f][0]) {
        console.log("options[i][0]", b[f][0]);
        e = b[f][1];
        break;
      }
    }
    e && (e = String(e));
    console.log("ParamDropdownDynamic result", e);
    return e;
  };
  b.ParamKeyboard = function(a, b, c) {
    console.log("ParamKeyboard value, paramMeta, paramDefMeta", a, b, c);
    a = Entry.KeyboardCode.prototype.keyCharToCode[a];
    console.log("ParamKeyboard result", a);
    return a;
  };
  b.Indicator = function(a, b, c) {
  };
  b.MemberExpression = function(a) {
    console.log("MemberExpression component", a);
    var b = {}, c, e = a.object, f = a.property;
    c = this[e.type](e);
    b.object = c;
    var g = this[f.type](f);
    b.property = g;
    console.log("MemberExpression objectData", c);
    console.log("MemberExpression propertyData", g);
    if ("call" == g.name && 0 == g.userCode) {
      return b;
    }
    if ("__pythonRuntime.ops.subscriptIndex" == g.callee) {
      e = Entry.playground.object;
      if (c.object && "self" == c.object.name) {
        if (f = c.property.name, !Entry.TextCodingUtil.prototype.isLocalListExisted(f, e)) {
          return b;
        }
      } else {
        if (f = c.name, !Entry.TextCodingUtil.prototype.isGlobalListExisted(f)) {
          return b;
        }
      }
      c = e = this.getBlockType("%2[%4]");
      var arguments = g.arguments, e = Entry.block[e], h = e.params, k = e.def.params, f = this.ParamDropdownDynamic(f, h[1], k[1]);
      console.log("MemberExpression listName", f);
      g = [];
      g.push("");
      g.push(f);
      g.push("");
      "number" == arguments[0].type ? arguments[0].params[0] += 1 : "text" == arguments[0].type && (arguments[0].params[0] = String(Number(arguments[0].params[0]) + 1));
      g.push(arguments[0]);
      g.push("");
      b.type = c;
      b.params = g;
    } else {
      if (g = [], "self" == e.name) {
        c = e = this.getBlockType("%1");
        e = Entry.block[e];
        h = e.params;
        k = e.def.params;
        f = f.name;
        e = Entry.playground.object;
        if (!Entry.TextCodingUtil.prototype.isLocalVariableExisted(f, e)) {
          return b;
        }
        f = this.ParamDropdownDynamic(f, h[0], k[0]);
        g.push(f);
        b.type = c;
        0 != g.length && (b.params = g);
      } else {
        return b;
      }
    }
    console.log("MemberExpression result", b);
    return b;
  };
  b.WhileStatement = function(a) {
    console.log("WhileStatement component", a);
    var b;
    b = {statements:[]};
    var c = a.test;
    console.log("WhileStatement test", c);
    if (!0 === c.value) {
      var e = this.getBlockType("while True:\n$1")
    }
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      f = Entry.block[e].params;
      c = Entry.block[e].def.params;
      console.log("WhileStatement paramsMeta", f);
      console.log("WhileStatement paramsDefMeta", c);
      for (var h in f) {
        var k = f[h].type;
        "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (var l in arguments) {
        h = arguments[l], console.log("WhileStatement argument", h), h = this[h.type](h, f[l], c[l], !0), console.log("WhileStatement Literal param", h), h && null != h && g.push(h);
      }
    } else {
      h = this[c.type](c), console.log("WhileStatement Not Literal param", h), h && null != h && g.push(h);
    }
    f = a.body;
    f = this[f.type](f);
    console.log("WhileStatement bodyData", f);
    "True" == g[0].type && (b.type = e, b.statements.push(f.statements));
    console.log("WhileStatement result", b);
    return b;
  };
  b.BlockStatement = function(a) {
    console.log("BlockStatement component", a);
    var b = {statements:[], data:[]}, c = [], e = [], f = [];
    a = a.body;
    console.log("BlockStatement bodies", a);
    for (var g in a) {
      var h = a[g], h = this[h.type](h);
      console.log("BlockStatement bodyData", h);
      h && null == h || (f.push(h), console.log("BlockStatement data", f));
    }
    console.log("BlockStatement final data", f);
    b.data = f;
    console.log("jhlee data check", f);
    for (var k in f) {
      if (f[1] && "repeat_basic" == f[1].type) {
        if (0 == k) {
          if (f[k].declarations) {
            a = f[0].declarations;
            for (k in a) {
              h = a[k], (h = h.init) && c.push(h);
            }
            b.params = c;
          }
        } else {
          if (1 == k) {
            b.type = f[k].type;
            e = [];
            a = f[k].statements[0];
            console.log("BlockStatement allStatements", a);
            if (a && 0 != a.length) {
              for (g in a) {
                h = a[g], console.log("BlockStatement(for) statement", h), h.type && e.push(h);
              }
            }
            console.log("BlockStatement(for) statements", e);
            b.statements.push(e);
          }
        }
      } else {
        if (f) {
          if (0 == k) {
            if (f[k] && f[k].declarations) {
              a = f[k].declarations;
              for (k in a) {
                h = a[k], (h = h.init) && c.push(h);
              }
              b.params = c;
            } else {
              (h = f[k]) && h.type && e.push(h);
            }
          } else {
            e = [];
            if ((a = f) && 0 != a.length) {
              for (g in a) {
                h = a[g], console.log("BlockStatement statement", h), h && h.type && e.push(h);
              }
            }
            console.log("BlockStatement statements", e);
          }
          b.statements = e;
        }
      }
    }
    console.log("BlockStatement statement result", b);
    return b;
  };
  b.IfStatement = function(a) {
    console.log("IfStatement component", a);
    var b;
    b = {statements:[]};
    var c, e = [], f = a.consequent, g = a.alternate;
    c = null != g ? "if_else" : "_if";
    b.type = c;
    console.log("IfStatement type", c);
    var h = a.test;
    console.log("IfStatement test", h);
    if ("Literal" == h.type || "Identifier" == h.type) {
      arguments = [];
      arguments.push(h);
      h = Entry.block[c].params;
      c = Entry.block[c].def.params;
      console.log("IfStatement paramsMeta", h);
      console.log("IfStatement paramsDefMeta", c);
      for (var k in h) {
        var l = h[k].type;
        "Indicator" == l ? (l = {raw:null, type:"Literal", value:null}, k < arguments.length && arguments.splice(k, 0, l)) : "Text" == l && (l = {raw:"", type:"Literal", value:""}, k < arguments.length && arguments.splice(k, 0, l));
      }
      for (var m in arguments) {
        k = arguments[m], console.log("IfStatement argument", k), k = this[k.type](k, h[m], c[m], !0), console.log("IfStatement Literal param", k), k && null != k && e.push(k);
      }
    } else {
      k = this[h.type](h), console.log("IfStatement Not Literal param", k), k && null != k && e.push(k);
    }
    e && 0 != e.length && (b.params = e);
    console.log("IfStatement params result", e);
    if (null != f) {
      e = [];
      console.log("IfStatement consequent", f);
      f = this[f.type](f);
      console.log("IfStatement consequent data", f);
      f = f.data;
      console.log("IfStatement consequentsData", f);
      for (m in f) {
        h = f[m], console.log("IfStatement consData", h), h && (h.init && h.type ? (b.type = h.type, (h = h.statements) && (e = h)) : !h.init && h.type && e.push(h));
      }
      0 != e.length && (b.statements[0] = e);
    }
    if (null != g) {
      f = [];
      console.log("IfStatement alternate", g);
      g = this[g.type](g);
      console.log("IfStatement alternate data", g);
      g = g.data;
      for (m in g) {
        (e = g[m]) && e.type && f.push(e);
      }
      0 != f.length && (b.statements[1] = f);
    }
    console.log("IfStatement result", b);
    return b;
  };
  b.ForStatement = function(a) {
    console.log("ForStatement component", a);
    var b = {statements:[]}, c = this.getBlockType("for i in range");
    b.type = c;
    if (c = a.init) {
      var e = this[c.type](c)
    }
    b.init = e;
    console.log("ForStatement init", c);
    e = a.body.body;
    console.log("ForStatement bodies", e);
    if (e) {
      for (var f in e) {
        0 != f && (c = e[f], console.log("ForStatement bodyData", c, "index", f), c = this[c.type](c), console.log("ForStatement bodyData result", c, "index", f), b.statements.push(c));
      }
    }
    console.log("ForStatement bodyData result", b);
    if (f = a.test) {
      var g = this[f.type](f)
    }
    b.test = g;
    console.log("ForStatement testData", g);
    if (a = a.update) {
      var h = this[a.type](a)
    }
    b.update = h;
    console.log("ForStatement updateData", h);
    console.log("ForStatement result", b);
    return b;
  };
  b.ForInStatement = function(a) {
    console.log("ForInStatement component", a);
    console.log("ForInStatement result", null);
    return null;
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement component", a);
    a = {};
    var b = this.getBlockType("break");
    console.log("BreakStatement type", b);
    a.type = b;
    console.log("BreakStatement result", a);
    return a;
  };
  b.UnaryExpression = function(a) {
    console.log("UnaryExpression component", a);
    var b;
    a.prefix && (b = a.operator, a = a.argument, console.log("UnaryExpression operator", b), a.value = Number(b.concat(a.value)), b = this[a.type](a), console.log("UnaryExpression data", b));
    a = b;
    console.log("UnaryExpression result", a);
    return a;
  };
  b.LogicalExpression = function(a) {
    console.log("LogicalExpression component", a);
    var b;
    b = {};
    var c = String(a.operator);
    switch(c) {
      case "&&":
        var e = "(%1 and %3)";
        break;
      case "||":
        e = "(%1 or %3)";
        break;
      default:
        e = "(%1 and %3)";
    }
    var e = this.getBlockType(e), f = [], c = a.left;
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      var c = Entry.block[e].params, g = Entry.block[e].def.params;
      console.log("LogicalExpression paramsMeta", c);
      console.log("LogicalExpression paramsDefMeta", g);
      for (var h in c) {
        var k = c[h].type;
        "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (var l in arguments) {
        var m = arguments[l];
        console.log("LogicalExpression argument", m);
        m = this[m.type](m, c[l], g[l], !0);
        console.log("LogicalExpression param", m);
        m && null != m && f.push(m);
      }
    } else {
      (m = this[c.type](c)) && f.push(m);
    }
    console.log("LogicalExpression left param", m);
    c = String(a.operator);
    console.log("LogicalExpression operator", c);
    c && (m = c = Entry.TextCodingUtil.prototype.logicalExpressionConvert(c), f.push(m));
    c = a.right;
    if ("Literal" == c.type || "Identifier" == c.type) {
      arguments = [];
      arguments.push(c);
      c = Entry.block[e].params;
      g = Entry.block[e].def.params;
      console.log("LogicalExpression paramsMeta", c);
      console.log("LogicalExpression paramsDefMeta", g);
      for (h in c) {
        k = c[h].type, "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (l in arguments) {
        m = arguments[l], console.log("LogicalExpression argument", m), m = this[m.type](m, c[l], g[l], !0), console.log("LogicalExpression param", m), m && null != m && f.push(m);
      }
    } else {
      (m = this[c.type](c)) && f.push(m);
    }
    console.log("LogicalExpression right param", m);
    b.type = e;
    b.params = f;
    console.log("LogicalExpression result", b);
    return b;
  };
  b.BinaryExpression = function(a) {
    console.log("BinaryExpression component", a);
    var b = {}, c = {}, e = String(a.operator);
    switch(e) {
      case "==":
        var f = "(%1 %2boolean_compare# %3)";
        break;
      case "!=":
        f = "(%2 != True)";
        break;
      case "<":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case "<=":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case ">":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case ">=":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case "+":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "-":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "*":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "/":
        f = "(%1 %2calc_basic# %3)";
    }
    console.log("BinaryExpression operator", e);
    console.log("BinaryExpression syntax", f);
    if (f = this.getBlockType(f)) {
      console.log("BinaryExpression type", f);
      b = [];
      e = a.left;
      console.log("BinaryExpression left", e);
      if ("Literal" == e.type || "Identifier" == e.type) {
        arguments = [];
        arguments.push(e);
        var e = Entry.block[f].params, g = Entry.block[f].def.params;
        console.log("BinaryExpression paramsMeta", e);
        console.log("BinaryExpression paramsDefMeta", g);
        for (var h in e) {
          var k = e[h].type;
          "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
        }
        for (var l in arguments) {
          var m = arguments[l];
          console.log("BinaryExpression argument", m);
          m = this[m.type](m, e[l], g[l], !0);
          console.log("BinaryExpression param", m);
          m && null != m && b.push(m);
        }
      } else {
        (m = this[e.type](e)) && b.push(m);
      }
      console.log("BinaryExpression left params", b);
      if ("boolean_not" == f) {
        return b.splice(0, 0, ""), b.splice(2, 0, ""), console.log("BinaryExpression boolean_not params", b), c.type = f, c.params = b, c;
      }
      if (e = String(a.operator)) {
        console.log("BinaryExpression operator", e), (m = e = Entry.TextCodingUtil.prototype.binaryOperatorConvert(e)) && b.push(m), c.operator = e;
      }
      e = a.right;
      if ("Literal" == e.type || "Identifier" == e.type) {
        arguments = [];
        arguments.push(e);
        e = Entry.block[f].params;
        g = Entry.block[f].def.params;
        console.log("BinaryExpression paramsMeta", e);
        console.log("BinaryExpression paramsDefMeta", g);
        for (h in e) {
          k = e[h].type, "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
        }
        for (l in arguments) {
          m = arguments[l], console.log("BinaryExpression argument", m), m = this[m.type](m, e[l], g[l], !0), console.log("BinaryExpression param", m), m && null != m && b.push(m);
        }
      } else {
        (m = this[e.type](e)) && b.push(m);
      }
      console.log("BinaryExpression right param", m);
      c.type = f;
      c.params = b;
    } else {
      return b;
    }
    console.log("BinaryExpression params", b);
    b = c;
    console.log("BinaryExpression result", b);
    return b;
  };
  b.UpdateExpression = function(a) {
    console.log("UpdateExpression", a);
    var b = {}, c = a.argument;
    if (c) {
      var e = this[c.type](c)
    }
    b.argument = e;
    b.operator = a.operator;
    b.prefix = a.prefix;
    console.log("UpdateExpression result", b);
    return b;
  };
  b.AssignmentExpression = function(a) {
    console.log("AssignmentExpression component", a);
    var b = {}, c, e = [], f, g = a.left;
    g.type && (f = this[g.type](g), console.log("AssignmentExpression leftData", f));
    console.log("AssignmentExpression leftData", f);
    b.left = f;
    operator = String(a.operator);
    console.log("AssignmentExpression operator", operator);
    g = a.right;
    if (g.type) {
      var h = this[g.type](g);
      console.log("AssignmentExpression rightData", h);
    }
    b.right = h;
    switch(operator) {
      case "=":
        if (h.callee && h.callee.object) {
          var k = h.callee.object.object.name.concat(".").concat(h.callee.object.property.name).concat(".").concat(h.callee.property.name)
        }
        if ("__pythonRuntime.objects.list" == k && "self" == f.object.name) {
          var l = f.property.name;
          c = [];
          var arguments = h.arguments, m;
          for (m in arguments) {
            var n = {};
            n.data = String(arguments[m].params[0]);
            c.push(n);
          }
          n = Entry.playground.object;
          Entry.TextCodingUtil.prototype.isLocalListExisted(l, n) ? Entry.TextCodingUtil.prototype.updateLocalList(l, c, n) : Entry.TextCodingUtil.prototype.createLocalList(l, c, n);
        }
        if (f.property && "__pythonRuntime.ops.subscriptIndex" == f.property.callee) {
          var l = "%1[%2] = %3", q = this.getBlockType(l)
        } else {
          g.arguments && g.arguments[0] ? (c = a.left.name ? a.left.name : a.left.object.name.concat(a.left.property.name), l = a.right.arguments[0].name ? a.right.arguments[0].name : a.right.arguments[0].object.name.concat(a.right.arguments[0].property.name), console.log("AssignmentExpression leftEx", c, "rightEx", l), l = a.right.arguments && c == l ? "%1 += %2" : "%1 = %2") : l = "%1 = %2", q = this.getBlockType(l);
        }
        c = q;
    }
    if (operator) {
      var r = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator)
    }
    b.operator = r;
    console.log("AssignmentExpression syntax", l);
    f.object ? n = f.object : f.name && (n = f.name);
    if (f.proprty) {
      var t = f.property
    } else {
      f.name && (t = f.name);
    }
    console.log("AssignmentExpression object property value", n, t);
    if ("%1[%2] = %3" == l) {
      n = Entry.block[q];
      k = n.params;
      r = n.def.params;
      t = f.params[1];
      console.log("AssignmentExpression listName", t);
      if (!t) {
        return b;
      }
      e.push(t);
      f = f.property.arguments[0];
      console.log("AssignmentExpression param 1", f);
      console.log("AssignmentExpression param 2", f);
      e.push(f);
      e.push(h);
    } else {
      if ("%1 = %2" == l) {
        console.log("AssignmentExpression calleeName check", k), n && "self" == n.name && "__pythonRuntime.objects.list" != k ? (n = Entry.block[q], k = n.params, r = n.def.params, l = t.name, (f = "number" == h.type || "text" == h.type ? h.params[0] : NaN) && NaN != f && (n = Entry.playground.object, console.log("final value", f), console.log("final object", n), Entry.TextCodingUtil.prototype.isLocalVariableExisted(l, n) ? Entry.TextCodingUtil.prototype.updateLocalVariable(l, f, n) : Entry.TextCodingUtil.prototype.createLocalVariable(l, 
        f, n)), l = this.ParamDropdownDynamic(l, k[0], r[0]), e.push(l)) : (n = Entry.block[q], k = n.params, r = n.def.params, console.log("property 123", t), l = t, (f = "number" == h.type || "text" == h.type ? h.params[0] : NaN) && NaN != f && (n = Entry.playground.object, console.log("final object", n), console.log("final value", f), Entry.TextCodingUtil.prototype.isGlobalVariableExisted(l, n) ? Entry.TextCodingUtil.prototype.updateGlobalVariable(l, f, n) : Entry.TextCodingUtil.prototype.createGlobalVariable(l, 
        f, n)), l = this.ParamDropdownDynamic(l, k[0], r[0]), e.push(l), h.callee && delete h.callee), e.push(h);
      } else {
        if ("%1 += %2" == l) {
          if (n && "self" == n.name) {
            if (n = Entry.block[q], k = n.params, r = n.def.params, l = t.name, n = Entry.playground.object, console.log("final object", n), !Entry.TextCodingUtil.prototype.isLocalVariableExisted(l, n)) {
              return b;
            }
          } else {
            if (n = Entry.block[q], k = n.params, r = n.def.params, l = t, !Entry.TextCodingUtil.prototype.isGlobalVariableExisted(l)) {
              return b;
            }
          }
          l = this.ParamDropdownDynamic(l, k[0], r[0]);
          e.push(l);
          e.push(h.params[2]);
        }
      }
    }
    b.type = c;
    b.params = e;
    console.log("AssignmentExpression result", b);
    return b;
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration component", a);
    var b = {}, c = a.body;
    a = a.id;
    if ("__getParam0" == a.name) {
      return b;
    }
    var e = this[c.type](c);
    console.log("FunctionDeclaration bodyData", e);
    if ("Identifier" == a.type) {
      var f = this[a.type](a)
    }
    console.log("FunctionDeclaration idData", f);
    c = [];
    a = [];
    var f = f.name, e = e.data, g;
    for (g in e) {
      if (e[g].declarations) {
        var h = e[g].declarations;
        0 < h.length && c.push(h[0].name);
      } else {
        e[g].argument && (h = e[g].argument.statements) && 0 < h.length && (a = h);
      }
    }
    console.log("FunctionDeclaration textFuncName", f);
    console.log("FunctionDeclaration textFuncParams", c);
    console.log("FunctionDeclaration textFuncStatements", a);
    var k, l, m, e = Entry.variableContainer.functions_, n;
    for (n in e) {
      var q = e[n];
      Entry.TextCodingUtil.prototype.initQueue();
      Entry.TextCodingUtil.prototype.gatherFuncDefParam(q.content._data[0]._data[0].data.params[0]);
      console.log("Entry.TextCodingUtil._funcParamQ", Entry.TextCodingUtil.prototype._funcParamQ);
      for (var r = [], h = {};g = Entry.TextCodingUtil.prototype._funcParamQ.dequeue();) {
        r.push(g), console.log("param", g);
      }
      console.log("funcParams", r);
      for (var t in r) {
        h[r[t]] = t;
      }
      console.log("paramMap", h);
      console.log("funcNameQueue", Entry.TextCodingUtil.prototype._funcNameQ);
      for (g = [];nameToken = Entry.TextCodingUtil.prototype._funcNameQ.dequeue();) {
        g.push(nameToken), console.log("funcNames", nameToken);
      }
      Entry.TextCodingUtil.prototype.clearQueue();
      blockFuncName = g.join("__").trim();
      console.log("first blockFuncName", blockFuncName);
      console.log("first textFuncName", f);
      if (f == blockFuncName) {
        if (console.log("textFuncName", f), console.log("blockFuncName", blockFuncName), console.log("textFuncParams.length", c.length), console.log("Object.keys(paramMap).length", Object.keys(h).length), c.length == Object.keys(h).length ? (k = !0, console.log("textFuncParams.length", c.length), console.log("Object.keys(paramMap).length", Object.keys(h).length), l = q.content._data[0]._data, g = l.slice(), g.shift(), console.log("blockFuncContents", l), l = Entry.TextCodingUtil.prototype.isFuncContentsMatch(g, 
        a, h)) : l = k = !1, k && l) {
          m = "func".concat("_").concat(n);
          break;
        } else {
          if (k && !l) {
            m = n;
            break;
          }
        }
      }
    }
    console.log("FunctionDeclaration foundFlag", k);
    console.log("FunctionDeclaration matchFlag", l);
    if (k && l) {
      console.log("targetFuncId", m);
      var u = c.length;
      this._funcMap.put(f + u, m);
      console.log("FunctionDeclaration this._funcMap", this._funcMap);
      b = m;
    } else {
      if (k && !l) {
        b = Entry.variableContainer.functions_[m];
        n = b.content._data[0];
        n._data.splice(1, n._data.length - 1);
        if (0 < a.length) {
          for (u in a) {
            t = a[u], t = new Entry.Block(t, n), n._data.push(t);
          }
        }
        Entry.variableContainer.saveFunction(b);
        Entry.variableContainer.updateList();
        b = m;
        console.log("textFuncName", f);
        u = c.length;
        u = f + u;
        n = m;
        m = "func".concat("_").concat(n);
        this._funcMap.put(u, m);
        console.log("FunctionDeclaration result", b);
      } else {
        console.log("FunctionDeclaration textFuncName", f);
        console.log("FunctionDeclaration textFuncParams", c);
        console.log("FunctionDeclaration textFuncStatements", a);
        k = new Entry.Func;
        k.generateBlock(!0);
        console.log("FunctionDeclaration newFunc", k);
        m = [];
        for (g = 1;g <= c.length + 1;g++) {
          m.push("%" + g);
        }
        k.block.template = f + " " + m.join(" ");
        console.log("newFunc template", k.block.template);
        n = k.content._data[0];
        t = n._data[0].data.params[0];
        m = t.data.params;
        k.description = "";
        g = f.split("__");
        if (0 < g.length) {
          for (e = 1;e < g.length;e++) {
            h = g[e], q = new Entry.Block({type:"function_field_label"}, n), q.data.params = [], q.data.params.push(h), l = Entry.TextCodingUtil.prototype.getLastParam(t), l.data.params[1] = q, k.description += h.concat(" ");
          }
          k.description += " ";
        } else {
          m[0] = f, k.description = f + " ";
        }
        if (0 < c.length) {
          for (e = new Entry.Block({type:"function_field_string"}, n), e.data.params = [], h = Entry.Func.requestParamBlock("string"), console.log("FunctionDeclaration stringParam", h), g = new Entry.Block({type:h}, n), e.data.params.push(g), l = Entry.TextCodingUtil.prototype.getLastParam(t), l.data.params[1] = e, k.paramMap[h] = Number(0), console.log("FunctionDeclaration paramBlock", k), t = 1;t < c.length;t++) {
            e = new Entry.Block({type:"function_field_string"}, n), e.data.params = [], h = Entry.Func.requestParamBlock("string"), console.log("FunctionDeclaration stringParam", h), g = new Entry.Block({type:h}, n), e.data.params.push(g), l = Entry.TextCodingUtil.prototype.searchFuncDefParam(m[1]), console.log("FunctionDeclaration paramBlock", l), 0 == l.data.params.length ? l.data.params[0] = g : 1 == l.data.params.length && (l.data.params[1] = e), k.paramMap[h] = Number(t), console.log("FunctionDeclaration paramBlock", 
            k);
          }
        }
        if (0 < a.length) {
          for (u in a) {
            t = a[u], t = new Entry.Block(t, n), n._data.push(t);
          }
        }
        Entry.Func.generateWsBlock(k);
        Entry.variableContainer.saveFunction(k);
        Entry.variableContainer.updateList();
        u = c.length;
        u = f + u;
        n = k.id;
        m = "func".concat("_").concat(n);
        this._funcMap.put(u, m);
        console.log("FunctionDeclaration newFunc", k);
      }
    }
    console.log("FunctionDeclaration result", b);
  };
  b.FunctionExpression = function(a) {
    console.log("FunctionExpression component", a);
    var b = {};
    a = a.body;
    a = this[a.type](a);
    console.log("FunctionExpression bodyData", a);
    b.statements = a.statements;
    console.log("FunctionExpression result", b);
    return b;
  };
  b.ReturnStatement = function(a) {
    console.log("ReturnStatement component", a);
    var b = {};
    if (a = a.argument) {
      var c = this[a.type](a)
    }
    c && (b.argument = c);
    console.log("ReturnStaement result", b);
    return b;
  };
  b.ThisExpression = function(a) {
    console.log("ThisExpression component", a);
    var b = {};
    if (a = a.userCode) {
      b.userCode = a;
    }
    console.log("ThisExpression result", b);
    return b;
  };
  b.NewExpression = function(a) {
    console.log("NewExpression component", a);
    var b = {}, c = a.callee, c = this[c.type](c), arguments = a.arguments, e = [], f;
    for (f in arguments) {
      var g = arguments[f];
      console.log("NewExpression argument", g);
      g = this[g.type](g);
      e.push(g);
    }
    b.callee = c;
    b.arguments = e;
    console.log("NewExpression result", b);
    return b;
  };
  b.getBlockType = function(a) {
    return this.blockSyntax[a];
  };
  b.RegExp = function(a) {
    console.log("RegExp", a);
    console.log("RegExp result", a);
    return a;
  };
  b.Function = function(a) {
    console.log("Function component", a);
    console.log("Function result", a);
    return a;
  };
  b.EmptyStatement = function(a) {
    console.log("EmptyStatement component", a);
    console.log("EmptyStatement result", a);
    return a;
  };
  b.DebuggerStatement = function(a) {
    console.log("DebuggerStatement component", a);
    console.log("DebuggerStatement result", a);
    return a;
  };
  b.WithStatement = function(a) {
    console.log("WithStatement component", a);
    console.log("WithStatement result", a);
    return a;
  };
  b.LabeledStatement = function(a) {
    console.log("LabeledStatement component", a);
    console.log("LabeledStatement result", a);
    return a;
  };
  b.ContinueStatement = function(a) {
    console.log("ContinueStatement component", a);
    console.log("ContinueStatement result", a);
    return a;
  };
  b.SwitchStatement = function(a) {
    console.log("SwitchStatement component", a);
    console.log("SwitchStatement result", a);
    return a;
  };
  b.SwitchCase = function(a) {
    console.log("SwitchCase component", a);
    console.log("SwitchCase result", a);
    return a;
  };
  b.ThrowStatement = function(a) {
    console.log("ThrowStatement component", a);
    console.log("ThrowStatement result", a);
    return a;
  };
  b.TryStatement = function(a) {
    console.log("TryStatement component", a);
    console.log("TryStatement result", a);
    return a;
  };
  b.CatchClause = function(a) {
    console.log("CatchClause component", a);
    console.log("CatchClause result", a);
    return a;
  };
  b.DoWhileStatement = function(a) {
    console.log("DoWhileStatement component", a);
    console.log("DoWhileStatement result", a);
    return a;
  };
  b.ArrayExpression = function(a) {
    console.log("ArrayExpression component", a);
    console.log("ArrayExpression result", a);
    return a;
  };
  b.ObjectExpression = function(a) {
    console.log("ObjectExpression component", a);
    console.log("ObjectExpression result", a);
    return a;
  };
  b.Property = function(a) {
    console.log("Property component", a);
    console.log("Property result", a);
    return a;
  };
  b.ConditionalExpression = function(a) {
    console.log("ConditionalExpression component", a);
    console.log("ConditionalExpression result", a);
    return a;
  };
  b.SequenceExpression = function(a) {
    console.log("SequenceExpression component", a);
    console.log("SequenceExpression result", a);
    return a;
  };
})(Entry.PyToBlockParser.prototype);
Entry.Parser = function(b, a, d, c) {
  this._mode = b;
  this.syntax = {};
  this.codeMirror = d;
  this._lang = c || "js";
  this._type = a;
  this.availableCode = [];
  Entry.Parser.PARSE_GENERAL = 0;
  Entry.Parser.PARSE_SYNTAX = 1;
  Entry.Parser.PARSE_VARIABLE = 2;
  Entry.Parser.BLOCK_SKELETON_BASIC = "basic";
  Entry.Parser.BLOCK_SKELETON_BASIC_LOOP = "basic_loop";
  Entry.Parser.BLOCK_SKELETON_BASIC_DOUBLE_LOOP = "basic_double_loop";
  this._console = new Entry.Console;
  switch(this._lang) {
    case "js":
      this._parser = new Entry.JsToBlockParser(this.syntax);
      break;
    case "py":
      this._parser = new Entry.PyToBlockParser(this.syntax);
      c = this.syntax;
      var e = {}, f;
      for (f in c.Scope) {
        e[f + "();\n"] = c.Scope[f];
      }
      "BasicIf" in c && (e.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(a) {
        CodeMirror.showHint(a, null, {globalScope:e});
      };
      d.on("keyup", function(a, b) {
        (65 <= b.keyCode && 95 >= b.keyCode || 167 == b.keyCode || 190 == b.keyCode) && CodeMirror.showHint(a, null, {completeSingle:!1, globalScope:e});
      });
      break;
    case "blockJs":
      this._parser = new Entry.BlockToJsParser(this.syntax);
      c = this.syntax;
      break;
    case "blockPy":
      this._parser = new Entry.BlockToPyParser(this.syntax), c = this.syntax;
  }
};
(function(b) {
  b.setParser = function(a, b, c) {
    this._mode = a;
    this._type = b;
    this._cm = c;
    this.syntax = this.mappingSyntax(a);
    switch(b) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        this._parser = new Entry.JsToBlockParser(this.syntax);
        this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK;
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        this._parser = new Entry.PyToBlockParser(this.syntax);
        this._parserType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK;
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        this._parser = new Entry.BlockToJsParser(this.syntax);
        a = this.syntax;
        var e = {}, f;
        for (f in a.Scope) {
          e[f + "();\n"] = a.Scope[f];
        }
        c.on("keydown", function(a, b) {
          var d = b.keyCode;
          (65 <= d && 95 >= d || 167 == d || !b.shiftKey && 190 == d) && CodeMirror.showHint(a, null, {completeSingle:!1, globalScope:e});
        });
        this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK;
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        this._parser = new Entry.BlockToPyParser(this.syntax), c.setOption("mode", {name:"python", globalVars:!0}), c.markText({line:0, ch:0}, {line:5}, {readOnly:!0}), this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY;
    }
  };
  b.parse = function(a, b) {
    var c = null;
    switch(this._type) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        try {
          var e = [];
          e.push(a);
          var f = [], g;
          for (g in e) {
            var h = e[g], h = h.trim(), k = acorn.parse(h);
            f.push(k);
          }
          c = this._parser.Program(f);
        } catch (q) {
          if (this.codeMirror) {
            q instanceof SyntaxError ? (c = {from:{line:q.loc.line - 1, ch:0}, to:{line:q.loc.line - 1, ch:q.loc.column}}, q.message = "\ubb38\ubc95(Syntax) \uc624\ub958\uc785\ub2c8\ub2e4.", q.type = 1) : (c = this.getLineNumber(q.node.start, q.node.end), c.message = q.message, c.severity = "converting error", q.type = 2);
            this.codeMirror.markText(c.from, c.to, {className:"CodeMirror-lint-mark-error", __annotation:c, clearOnEnter:!0});
            c = q.title ? q.title : "\ubb38\ubc95 \uc624\ub958";
            if (2 == q.type && q.message) {
              var l = q.message
            } else {
              2 != q.type || q.message ? 1 == q.type && (l = "\uc790\ubc14\uc2a4\ud06c\ub9bd\ud2b8 \ubb38\ubc95\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694.") : l = "\uc790\ubc14\uc2a4\ud06c\ub9bd\ud2b8 \ucf54\ub4dc\ub97c \ud655\uc778\ud574\uc8fc\uc138\uc694.";
            }
            Entry.toast.alert(c, l);
            l = {};
            l.boardType = Entry.Workspace.MODE_BOARD;
            l.textType = Entry.Vim.TEXT_TYPE_JS;
            l.runType = Entry.Vim.MAZE_MODE;
            Ntry.dispatchEvent("textError", l);
            throw q;
          }
          c = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        try {
          var m = new Entry.PyAstGenerator, e = a.split("\n\n"), n;
          for (n in e) {
            h = e[n], -1 != h.search("import") ? e[n] = "" : (h = Entry.TextCodingUtil.prototype.entryEventFuncFilter(h), e[n] = h);
          }
          f = [];
          for (g in e) {
            h = e[g], k = m.generate(h), "Program" == k.type && 0 != k.body.length && f.push(k);
          }
          c = this._parser.Program(f);
          this._parser._variableMap.clear();
        } catch (q) {
          if (this.codeMirror) {
            throw q instanceof SyntaxError ? (c = {from:{line:q.loc.line - 1, ch:q.loc.column - 2}, to:{line:q.loc.line - 1, ch:q.loc.column + 1}}, q.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (c = this.getLineNumber(q.node.start, q.node.end), c.message = q.message, c.severity = "error"), l = parseInt(c.to.line) + 1, c.from.line = l - 1, c.to.line = l, this.codeMirror.markText(c.from, c.to, {className:"CodeMirror-lint-mark-error", __annotation:c, clearOnEnter:!0}), c = q.title ? 
            q.title : "\ubb38\ubc95 \uc624\ub958", l = q.message && l ? q.message + " (line: " + l + ")" : "\ud30c\uc774\uc36c \ucf54\ub4dc\ub97c \ud655\uc778\ud574\uc8fc\uc138\uc694", Entry.toast.alert(c, l), q;
          }
          c = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        c = l = this._parser.Code(a, b);
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        l = this._parser.Code(a, b), this._pyHinter || (this._pyHinter = new Entry.PyHint), c = l;
    }
    return c;
  };
  b.getLineNumber = function(a, b) {
    var c = this.codeMirror.getValue(), e = {from:{}, to:{}}, f = c.substring(0, a).split(/\n/gi);
    e.from.line = f.length - 1;
    e.from.ch = f[f.length - 1].length;
    c = c.substring(0, b).split(/\n/gi);
    e.to.line = c.length - 1;
    e.to.ch = c[c.length - 1].length;
    return e;
  };
  b.mappingSyntax = function(a) {
    for (var b = Object.keys(Entry.block), c = {}, e = 0;e < b.length;e++) {
      var f = b[e], g = Entry.block[f];
      if (a === Entry.Vim.MAZE_MODE) {
        if (-1 < this.availableCode.indexOf(f) && (g = g.syntax)) {
          for (var h = c, k = 0;k < g.length;k++) {
            var l = g[k];
            if (!(-1 < l.indexOf("%"))) {
              var m = l.indexOf("(");
              -1 < m && (l = l.substring(0, m));
              if (k === g.length - 2 && "function" === typeof g[k + 1]) {
                h[l] = g[k + 1];
                break;
              }
              h[l] || (h[l] = {});
              k === g.length - 1 ? h[l] = f : h = h[l];
            }
          }
        }
      } else {
        if (a === Entry.Vim.WORKSPACE_MODE) {
          for (l in f = Entry.block, f) {
            g = f[l], h = null, g.syntax && g.syntax.py && (h = g.syntax.py), h && (h = String(h), g = h.split("("), 0 != g[0].length && (h = g[0]), c[h] = l);
          }
        }
      }
    }
    return c;
  };
  b.setAvailableCode = function(a, b) {
    var c = [], e;
    a instanceof Entry.Code ? e = a.getBlockList() : a.forEach(function(a, b) {
      e.concat(a);
    });
    e.forEach(function(a) {
      c.push(a.type);
    });
    e = [];
    b instanceof Entry.Code ? e = b.getBlockList() : b.forEach(function(a, b) {
      e.concat(a);
    });
    e.forEach(function(a) {
      -1 === c.indexOf(a.type) && c.push(a.type);
    });
    this.availableCode = this.availableCode.concat(c);
  };
  b.findErrorInfo = function(a) {
    var b = 0, c = 0, e = this.codeMirror.getValue().split("\n"), f;
    for (f in e) {
      var g = e[f].trim();
      b++;
      if (!(0 == g.length || 1 == g.length || -1 < g.indexOf("else")) && (c++, c == a.blockCount)) {
        break;
      }
    }
    return {lineNumber:b - b, location:a.node};
  };
})(Entry.Parser.prototype);
Entry.PyBlockAssembler = function(b) {
  this.blockSyntax = b;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
};
(function(b) {
  b.Program = function(a) {
    var b = [], c;
    for (c in a) {
      if ("Program" != a[c].type) {
        return;
      }
      var e = [], f = a[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      b.push(e);
    }
    return b;
  };
  b.ExpressionStatement = function(a) {
    console.log("ExpressionStatement component", a);
    var b = {};
    a = a.expression;
    "Literal" == a.type ? (a = this[a.type]({type:"Block", accept:"booleanMagnet"}, a), b.type = a.type, result = b, console.log("ExpressionStatement type literal", result)) : (a = this[a.type](a), b.type = a.type, b.params = a.params, result = b, console.log("ExpressionStatement type not literal", result));
    console.log("ExpressionStatement result", result);
    return result;
  };
  b.AssignmentExpression = function(a) {
    console.log("AssignmentExpression component", a);
    var b = [], c;
    c = a.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](paramsMeta[0], c), console.log("AssignmentExpression left Literal param", c)) : c = this[c.type](c), c && b.push(c), console.log("AssignmentExpression left param", c)) : (c = a.left, this[c.type](c));
    operator = String(a.operator);
    console.log("AssignmentExpression operator", operator);
    operator && (c = operator = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator), b.push(c));
    c = a.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](paramsMeta[2], c), console.log("AssignmentExpression right Literal param", c)) : c = this[c.type](c), c && b.push(c), console.log("AssignmentExpression right param", c)) : (c = a.right, this[c.type](c));
    console.log("AssignmentExpression params", b);
    console.log("AssignmentExpression result", result);
    return result;
  };
  b.CallExpression = function(a) {
    console.log("CallExpression component", a);
    var b;
    b = {};
    var c = a.callee, c = this[c.type](c);
    console.log("CallExpression calleeData", c, "calleeData typeof", typeof c);
    var e = "object" != typeof c.object ? String(c.object).concat(".").concat(String(c.property)) : String(c.object.object).concat(".").concat(String(c.object.property)).concat(".").concat(String(c.property));
    console.log("CallExpression syntax", e);
    c = this.getBlockType(e);
    console.log("CallExpression type1", c);
    c || "__pythonRuntime.functions.range" == e && (c = "repeat_basic");
    console.log("CallExpression type2", c);
    e = Entry.block[c].params;
    console.log("CallExpression paramsMeta", e);
    var arguments = a.arguments, f = [], g;
    for (g in arguments) {
      var h = arguments[g];
      console.log("CallExpression argument", h);
      if ("Literal" == h.type) {
        var k = e[g];
        "Indicator" == k.type ? (h = null, f.push(h), g--) : (console.log("CallExpression argument index", h.type, g), h = this[h.type](k, h, c, g), f.push(h));
        g == arguments.length - 1 && (console.log("CallExpression in1"), g < e.length && (console.log("CallExpression in2"), f.push(null)));
        console.log("CallExpression i", g);
      }
    }
    console.log("CallExpression params", f);
    b.type = c;
    b.params = f;
    console.log("CallExpression result", b);
    return b;
  };
  b.Literal = function(a, b, c, e) {
    console.log("Literal paramMeta component particularIndex blockType", a, b, c, e);
    b = b.value;
    a = c ? this["Param" + a.type](a, b, c, e) : this["Param" + a.type](a, b);
    console.log("Literal result", a);
    return a;
  };
  b.ParamColor = function(a, b) {
    console.log("ParamColor paramMeta value", a, b);
    console.log("ParamColor result", b);
    return b;
  };
  b.ParamDropdown = function(a, b) {
    console.log("ParamDropdown paramMeta value", a, b);
    console.log("ParamDropdownDynamic result", b);
    return b;
  };
  b.ParamDropdownDynamic = function(a, b) {
    console.log("ParamDropdownDynamic paramMeta value", a, b);
    var c;
    if ("mouse" == b) {
      return "mouse";
    }
    var e = a.options, f;
    for (f in e) {
      if (console.log("options", e), b == e[f][0]) {
        console.log("options[i][0]", e[f][0]);
        c = e[f][1];
        break;
      }
    }
    console.log("ParamDropdownDynamic result", c);
    return c;
  };
  b.ParamKeyboard = function(a, b) {
    console.log("ParamKeyboard paramMeta value", a, b);
    var c;
    c = Entry.KeyboardCodeMap.prototype.keyCharToCode[b];
    console.log("ParamKeyboard result", c);
    return c;
  };
  b.ParamBlock = function(a, b, c, e) {
    console.log("ParamBlock paramMeta value blockType", a, b, c, e);
    var f = {}, g = [];
    c = Entry.TextCodingUtil.prototype.particularParam(c);
    if (null != c) {
      var h = c[e];
      if (h) {
        h = c[e];
        console.log("ParamBlock particularType", h);
        e = h;
        f.type = e;
        c = Entry.block[e].params;
        console.log("ParamBlock particular block paramsMeta", a);
        var k, l;
        for (l in c) {
          a = c[l];
          a = a.options;
          for (var m in a) {
            h = a[m], b == h[0] && (k = h[1]);
          }
        }
        g.push(k);
        f.params = g;
      } else {
        switch(e = typeof b, e) {
          case "number":
            f.type = "number";
            g.push(b);
            f.params = g;
            break;
          case "boolean":
            1 == b ? f.type = "True" : 0 == b && (f.type = "False");
            break;
          default:
            f.type = "text", g.push(b), f.params = g;
        }
      }
    } else {
      switch(e = typeof b, e) {
        case "number":
          f.type = "number";
          g.push(b);
          f.params = g;
          break;
        case "boolean":
          1 == b ? f.type = "True" : 0 == b && (f.type = "False");
          break;
        default:
          f.type = "text", g.push(b), f.params = g;
      }
    }
    console.log("ParamBlock valueType", e);
    console.log("ParamBlock result", f);
    return f;
  };
  b.Indicator = function(a, b, c) {
  };
  b.MemberExpression = function(a) {
    console.log("MemberExpression component", a);
    var b = {}, c = a.object;
    a = a.property;
    c = this[c.type](c);
    a = this[a.type](a);
    console.log("MemberExpression objectData", c);
    console.log("MemberExpression structure", a);
    b.object = c;
    b.property = a;
    console.log("MemberExpression result", b);
    return b;
  };
  b.Identifier = function(a) {
    console.log("Identifiler component", a);
    a = a.name;
    console.log("Identifiler result", a);
    return a;
  };
  b.WhileStatement = function(a) {
    console.log("WhileStatement component", a);
    var b = {}, c = a.test, e;
    1 == c.value && (e = this.getBlockType("while True:\n$1"));
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    c && (c.type = "Literal", f = f[0], c = "Indicator" == f.type ? null : this[c.type](f, c), g.push(c));
    c = [];
    a = a.body.body;
    for (var h in a) {
      f = a[h], f = this[f.type](f), c.push(f);
    }
    b.type = e;
    b.params = g;
    b.statements = [];
    b.statements.push(c);
    console.log("WhileStatement result", b);
    return b;
  };
  b.BlockStatement = function(a) {
    console.log("BlockStatement component", a);
    this._blockStatmentIndex = 0;
    this._blockStatments = [];
    var b = {};
    a = a.body;
    for (var c in a) {
      var e = a[c];
      console.log("BlockStatement body", e, "i", c);
      e = this[e.type](e);
      console.log("BlockStatement bodyData", e, "i", c);
      if (e.declarations) {
        console.log("BlockStatement statements type params bodyData", c, e);
        var e = e.declarations, f;
        for (f in e) {
          var g = e[f];
          g.init.type && (b.type = g.init.type);
          g.init.params && (console.log("BlockStatement params", g.init.params), b.params = g.init.params);
          console.log("BlockStatement structure", b, "j", f);
        }
      } else {
        0 == this._blockStatmentIndex && this._blockStatments.push(e);
      }
    }
    b.statements = [this._blockStatments];
    console.log("BlockStatement result", b);
    this._blockStatmentIndex++;
    return b;
  };
  b.IfStatement = function(a) {
    console.log("IfStatement component", a);
    var b = {}, c = [], e = [], f = [], g = [], h = a.test, k = a.alternate, l = a.consequent;
    a = this.getBlockType(null == k ? "if %1:\n$1" : "if %1:\n$1\nelse:\n$2");
    if (null != h) {
      var m = Entry.block[a].params;
      console.log("IfStatement paramsMeta", m);
      c = [];
      h.type = "Literal";
      m = m[0];
      h = "Indicator" == m.type ? null : this[h.type](m, h);
      c.push(h);
    }
    if (null != l) {
      for (var n in l.body) {
        if (h = l.body[n]) {
          h = this[h.type](h), console.log("IfStatement consequent bodyData", h), e.push(h);
        }
      }
    }
    if (null != k) {
      for (n in k.body) {
        if (h = k.body[n]) {
          h = this[h.type](h), console.log("IfStatement alternate bodyData", h), f.push(h);
        }
      }
    }
    0 != e.length && g.push(e);
    0 != f.length && g.push(f);
    b.type = a;
    0 != c.length && (b.params = c);
    0 != g.length && (b.statements = g);
    console.log("IfStatement result", b);
    return b;
  };
  b.VariableDeclaration = function(a) {
    console.log("VariableDeclaration component", a);
    var b = {}, c = [];
    a = a.declarations;
    for (var e in a) {
      var f = a[e], f = this[f.type](f);
      console.log("VariableDeclaration declarationData", f);
      c.push(f);
    }
    b.declarations = c;
    console.log("VariableDeclaration result", b);
    return b;
  };
  b.VariableDeclarator = function(a) {
    console.log("VariableDeclarator component", a);
    var b = {}, c = a.id, e = this[c.type](c);
    console.log("VariableDeclarator idData", e);
    a = a.init;
    a = this[a.type](a);
    console.log("VariableDeclarator initData", a);
    b.id = c;
    b.init = a;
    console.log("VariableDeclarator result", b);
    return b;
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement component", a);
    a = {};
    var b = this.getBlockType("break");
    a.type = b;
    console.log("BreakStatement result", a);
    return a;
  };
  b.UnaryExpression = function(a) {
    console.log("UnaryExpression component", a);
    var b = [];
    a.prefix && (a = a.operator.concat(a.argument.value), b.push(a));
    result.params = b;
    console.log("UnaryExpression result", result);
    return result;
  };
  b.LogicalExpression = function(a) {
    console.log("LogicalExpression component", a);
    var b = {}, c = String(a.operator);
    switch(c) {
      case "&&":
        var e = "%1 and %3";
        break;
      case "||":
        e = "%1 or %3";
        break;
      default:
        e = "%1 and %3";
    }
    var e = this.getBlockType(e), f = Entry.block[e].params;
    console.log("LogicalExpression paramsMeta", f);
    var g = [], c = a.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[0], c), console.log("LogicalExpression left Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("LogicalExpression left param", c)) : (c = a.left, this[c.type](c));
    c = String(a.operator);
    console.log("LogicalExpression operator", c);
    c && (c = Entry.TextCodingUtil.prototype.logicalExpressionConvert(c), g.push(c));
    c = a.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[2], c), console.log("LogicalExpression right Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("LogicalExpression right param", c)) : (c = a.right, this[c.type](c));
    b.type = e;
    b.params = g;
    console.log("LogicalExpression result", b);
    return b;
  };
  b.BinaryExpression = function(a) {
    console.log("BinaryExpression component", a);
    var b = {params:[]}, c = String(a.operator);
    console.log("BinaryExpression operator", c);
    if (c) {
      var e = "(%1 %2 %3)"
    }
    console.log("BinaryExpression syntax", e);
    e = this.getBlockType(e);
    console.log("BinaryExpression type", e);
    var f = Entry.block[e].params;
    console.log("BinaryExpression paramsMeta", f);
    var g = [], c = a.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[0], c), console.log("BinaryExpression left Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("BinaryExpression left param", c)) : (c = a.left, this[c.type](c));
    if (c = String(a.operator)) {
      console.log("BinaryExpression operator", c), (c = Entry.TextCodingUtil.prototype.binaryOperatorConvert(c)) && g.push(c);
    }
    c = a.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[2], c), console.log("BinaryExpression right Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("BinaryExpression right param", c)) : (c = a.right, this[c.type](c));
    console.log("BinaryExpression params", g);
    b.type = e;
    b.params = g;
    console.log("BinaryExpression result", b);
    return b;
  };
  b.getBlockType = function(a) {
    return this.blockSyntax[a];
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration component", a);
    console.log("FunctionDeclaration result", void 0);
    return a;
  };
  b.RegExp = function(a) {
    console.log("RegExp", a);
    console.log("RegExp result", void 0);
    return a;
  };
  b.Function = function(a) {
    console.log("Function", a);
    console.log("Function result", void 0);
    return a;
  };
  b.EmptyStatement = function(a) {
    console.log("EmptyStatement", a);
    console.log("EmptyStatement result", void 0);
    return a;
  };
  b.DebuggerStatement = function(a) {
    console.log("DebuggerStatement", a);
    console.log("DebuggerStatement result", void 0);
    return a;
  };
  b.WithStatement = function(a) {
    console.log("WithStatement", a);
    console.log("WithStatement result", void 0);
    return a;
  };
  b.ReturnStaement = function(a) {
    console.log("ReturnStaement", a);
    console.log("ReturnStaement result", void 0);
    return a;
  };
  b.LabeledStatement = function(a) {
    console.log("LabeledStatement", a);
    console.log("LabeledStatement result", void 0);
    return a;
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement", a);
    console.log("BreakStatement result", void 0);
    return a;
  };
  b.ContinueStatement = function(a) {
    console.log("ContinueStatement", a);
    console.log("ContinueStatement result", void 0);
    return a;
  };
  b.SwitchStatement = function(a) {
    console.log("SwitchStatement", a);
    console.log("SwitchStatement result", void 0);
    return a;
  };
  b.SwitchCase = function(a) {
    console.log("SwitchCase", a);
    console.log("SwitchCase result", void 0);
    return a;
  };
  b.ThrowStatement = function(a) {
    console.log("ThrowStatement", a);
    console.log("ThrowStatement result", void 0);
    return a;
  };
  b.TryStatement = function(a) {
    console.log("TryStatement", a);
    console.log("TryStatement result", void 0);
    return a;
  };
  b.CatchClause = function(a) {
    console.log("CatchClause", a);
    console.log("CatchClause result", void 0);
    return a;
  };
  b.DoWhileStatement = function(a) {
    console.log("DoWhileStatement", a);
    console.log("DoWhileStatement result", void 0);
    return a;
  };
  b.ForInStatement = function(a) {
    console.log("ForInStatement", a);
    console.log("ForInStatement result", void 0);
    return a;
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration", a);
    console.log("FunctionDeclaration result", void 0);
    return a;
  };
  b.ThisExpression = function(a) {
    console.log("ThisExpression", a);
    console.log("ThisExpression result", void 0);
    return a;
  };
  b.ArrayExpression = function(a) {
    console.log("ArrayExpression", a);
    console.log("ArrayExpression result", void 0);
    return a;
  };
  b.ObjectExpression = function(a) {
    console.log("ObjectExpression", a);
    console.log("ObjectExpression result", void 0);
    return a;
  };
  b.Property = function(a) {
    console.log("Property", a);
    console.log("Property result", void 0);
    return a;
  };
  b.FunctionExpression = function(a) {
    console.log("FunctionExpression", a);
    console.log("FunctionExpression result", void 0);
    return a;
  };
  b.UpdateExpression = function(a) {
    console.log("UpdateExpression", a);
    console.log("UpdateExpression result", void 0);
    return a;
  };
  b.ConditionalExpression = function(a) {
    console.log("ConditionalExpression", a);
    console.log("ConditionalExpression result", void 0);
    return a;
  };
  b.NewExpression = function(a) {
    console.log("NewExpression", a);
    console.log("NewExpression result", void 0);
    return a;
  };
  b.SequenceExpression = function(a) {
    console.log("SequenceExpression", a);
    console.log("SequenceExpression result", void 0);
    return a;
  };
})(Entry.PyBlockAssembler.prototype);
Entry.PyToBlockParserTemp = function(b) {
  this._assembler = new Entry.PyBlockAssembler(b);
};
(function(b) {
  b.Program = function(a) {
    var b = [], c;
    for (c in a) {
      if ("Program" != a[c].type) {
        return;
      }
      var e = [], f = a[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      b.push(e);
    }
    return b;
  };
  b.Identifier = function(a) {
    console.log("Identifier", a);
    return {type:a.type, name:a.name};
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration", a);
    var b = this[a.id.type](a.id);
    return {type:a.type, id:b};
  };
  b.Literal = function(a) {
    console.log("Literal", a);
    console.log("typeof node at Literal", typeof a.value);
    var b;
    "string" === typeof a.value ? b = a.value : "boolean" === typeof a.value ? b = a.value : "number" === typeof a.value ? b = a.value : "RegExp" === typeof a.value ? (b = this[typeof a.value](a), b = b.regex.pattern) : b = null;
    console.log("value", b);
    return {type:a.type, value:b};
  };
  b.RegExp = function(a) {
    console.log("RegExp", a);
    return {regex:a.regex};
  };
  b.Function = function(a) {
    console.log("Function", a);
    var b = this[a.id](a), c = [], e;
    for (e in a.params) {
      c.push(a.params[e]);
    }
    a = this[a.body](a);
    return {id:b, params:c, body:a};
  };
  b.ExpressionStatement = function(a) {
    var b = this[a.expression.type](a.expression);
    return {type:a.type, expression:b};
  };
  b.BlockStatement = function(a) {
    console.log("BlockStatement", a);
    var b = [], c;
    for (c in a.body) {
      var e = a.body[c];
      console.log("BlockStatement statement", e);
      e = this[e.type](e);
      console.log("BlockStatement body", e);
      b.push(e);
    }
    console.log("bodies", b);
    return {type:a.type, body:b};
  };
  b.EmptyStatement = function(a) {
    console.log("EmptyStatement", a);
    return {type:a.type};
  };
  b.DebuggerStatement = function(a) {
    console.log("DebuggerStatement", a);
    return {type:a.type};
  };
  b.WithStatement = function(a) {
    console.log("WithStatement", a);
    var b = this[a.object.type](a.object), c = this[a.body.type](a.body);
    return {type:a.type, object:b, body:c};
  };
  b.ReturnStaement = function(a) {
    console.log("ReturnStaement", a);
    var b;
    b = null === a.argument ? null : this[a.argument.type](a.argument);
    return {type:a.type, argument:b};
  };
  b.LabeledStatement = function(a) {
    console.log("LabeledStatement", a);
    var b = this[a.label.type](a.label), c = this[a.body.type](a.body);
    return {type:a.type, label:b, body:c};
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement", a);
    var b;
    console.log("node.label", a.label);
    a.label && null !== a.label ? (console.log("node.label2", a.label), b = this[a.label.type](a.label)) : (console.log("node.lable1", a.label), b = null);
    console.log("label", b);
    return {type:a.type, label:b};
  };
  b.ContinueStatement = function(a) {
    console.log("ContinueStatement", a);
    var b;
    b = null === a.label ? null : this[a.label.type](a.label);
    return {type:a.type, label:b};
  };
  b.IfStatement = function(a) {
    console.log("IfStatement", a);
    var b = this[a.test.type](a.test), c = {body:[]};
    if (null === a.alternate) {
      c = null;
    } else {
      for (var e in a.alternate.body) {
        var f = a.alternate.body[e], g = this[f.type](f);
        c.body.push(g);
      }
    }
    g = {body:[]};
    for (e in a.consequent.body) {
      f = a.consequent.body[e], f = this[f.type](f), g.body.push(f);
    }
    console.log("alternate", c);
    console.log("consequent", g);
    return {type:a.type, test:b, consequent:g, alternate:c};
  };
  b.SwitchStatement = function(a) {
    console.log("SwitchStatement", a);
    var b = this[a.discriminant.type](a.discriminant), c = [], e;
    for (e in a.cases) {
      var f = a.cases[e], f = this[f.type](f);
      c.push(f);
    }
    return {type:a.type, discriminant:b, cases:c};
  };
  b.SwitchCase = function(a) {
    console.log("SwitchCase", a);
    var b;
    b = null === a.test ? null : this[a.test.type](a.test);
    for (var c in a.consequent) {
      a = this[statment.type](statment), (void 0).push(a);
    }
    return {test:b, consequent:void 0};
  };
  b.ThrowStatement = function(a) {
    console.log("ThrowStatement", a);
    var b = this[a.argument.type](a.argument);
    return {type:a.type, argument:b};
  };
  b.TryStatement = function(a) {
    console.log("TryStatement", a);
    var b = this[a.block.type](a.block), c;
    c = null === a.handler ? null : this[a.handler.type](a.handler);
    var e;
    e = null === a.finalizer ? null : this[a.finalizer.type](a.finalizer);
    return {type:a.type, block:b, handler:c, finalizer:e};
  };
  b.CatchClause = function(a) {
    console.log("CatchClause", a);
    var b = a.param;
    a = this[a.body.type](a.body);
    return {param:b, body:a};
  };
  b.WhileStatement = function(a) {
    console.log("WhileStatement", a);
    var b = this[a.test.type](a.test), c = this[a.body.type](a.body);
    console.log("WhileStatement test", b);
    console.log("WhileStatement body", c);
    return {type:a.type, test:b, body:c};
  };
  b.DoWhileStatement = function(a) {
    console.log("DoWhileStatement", a);
    var b;
    b = this[a.init.type](a.init);
    var c;
    c = null === a.test ? null : this[a.test.type](a.test);
    var e;
    e = null === a.update ? null : this[a.update.type](a.update);
    var f = this[a.body.type](a.body);
    return {type:a.type, init:b, test:c, update:e, body:f};
  };
  b.ForStatement = function(a) {
    console.log("ForStatement", a);
    var b;
    if (null === a.init) {
      b = null;
    } else {
      this[a.init.type](a.init);
    }
    var c;
    c = null === a.test ? null : this[a.test.type](a.test);
    var e;
    e = null === a.update ? null : this[a.update.type](a.update);
    var f = this[a.body.type](a.body);
    console.log("ForStatement body", f);
    return {type:a.type, init:b, test:c, update:e, body:f};
  };
  b.ForInStatement = function(a) {
    console.log("ForInStatement", a);
    var b;
    b = this[a.left.type](a.left);
    var c = this[a.right.type](a.right), e = this[a.body.type](a.body);
    return {type:a.type, left:b, right:c, body:e};
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration", a);
    return {id:this[a.id.type](a.id)};
  };
  b.VariableDeclaration = function(a) {
    console.log("VariableDeclaration", a);
    var b = [], c;
    for (c in a.declarations) {
      var e = a.declarations[c], e = this[e.type](e);
      console.log("declaration", e);
      b.push(e);
    }
    console.log("VariableDeclaration declarations", b);
    return {type:a.type, declarations:b, kind:"var"};
  };
  b.VariableDeclarator = function(a) {
    console.log("VariableDeclarator", a);
    var b = this[a.id.type](a.id), c;
    c = null === a.init ? null : this[a.init.type](a.init);
    console.log("id", b);
    console.log("init", c);
    return {type:a.type, id:b, init:c};
  };
  b.ThisExpression = function(a) {
    console.log("ThisExpression", a);
    return {type:a.type};
  };
  b.ArrayExpression = function(a) {
    console.log("ArrayExpression", a);
    var b;
    if (null === a.elements) {
      b = null;
    } else {
      for (var c in a.elements) {
        var e = a.elements[c], e = this[e.type](e);
        b.push(e);
      }
    }
    return {type:a.type, elements:b};
  };
  b.ObjectExpression = function(a) {
    console.log("ObjectExpression", a);
    for (var b in a.properties) {
      var c = a.properties[b], c = this[c.type](c);
      (void 0).push(c);
    }
    return {type:a.type, properties:void 0};
  };
  b.Property = function(a) {
    console.log("Property", a);
    var b = this[a.key.type](a.key), c = this[a.value.type](a.value);
    return {type:a.type, key:b, value:c, kind:a.kind};
  };
  b.FunctionExpression = function(a) {
    console.log("FunctionExpression", a);
    return {type:a.type};
  };
  b.UnaryExpression = function(a) {
    console.log("UnaryExpression", a);
    var b;
    switch(a.operator) {
      case "-":
        b = a.operator;
        break;
      case "+":
        b = a.operator;
        break;
      case "!":
        b = a.operator;
        break;
      case "~":
        b = a.operator;
        break;
      case "typeof":
        b = a.operator;
        break;
      case "void":
        b = a.operator;
        break;
      case "delete":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = a.prefix, e = this[a.argument.type](a.argument);
    return {type:a.type, operator:b, prefix:c, argument:e};
  };
  b.UpdateExpression = function(a) {
    console.log("UpdateExpression", a);
    var b;
    switch(a.operator) {
      case "++":
        b = a.operator;
        break;
      case "--":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = this[a.argument.type](a.argument);
    return {type:a.type, operator:b, prefix:a.prefix, argument:c};
  };
  b.BinaryExpression = function(a) {
    console.log("BinaryExpression", a);
    var b;
    switch(a.operator) {
      case "==":
        b = a.operator;
        break;
      case "!=":
        b = a.operator;
        break;
      case "===":
        b = a.operator;
        break;
      case "!==":
        b = a.operator;
        break;
      case "<":
        b = a.operator;
        break;
      case "<=":
        b = a.operator;
        break;
      case ">":
        b = a.operator;
        break;
      case ">=":
        b = a.operator;
        break;
      case "<<":
        b = a.operator;
        break;
      case ">>":
        b = a.operator;
        break;
      case ">>>":
        b = a.operator;
        break;
      case "+":
        b = a.operator;
        break;
      case "-":
        b = a.operator;
        break;
      case "*":
        b = a.operator;
        break;
      case "/":
        b = a.operator;
        break;
      case "%":
        b = a.operator;
        break;
      case "|":
        b = a.operator;
        break;
      case "^":
        b = a.operator;
        break;
      case "|":
        b = a.operator;
        break;
      case "&":
        b = a.operator;
        break;
      case "in":
        b = a.operator;
        break;
      case "instanceof":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = this[a.left.type](a.left), e = this[a.right.type](a.right);
    return {type:a.type, operator:b, left:c, right:e};
  };
  b.AssignmentExpression = function(a) {
    console.log("AssignmentExpression", a);
    var b;
    switch(a.operator) {
      case "=":
        b = a.operator;
        break;
      case "+=":
        b = a.operator;
        break;
      case "-=":
        b = a.operator;
        break;
      case "*=":
        b = a.operator;
        break;
      case "/=":
        b = a.operator;
        break;
      case "%=":
        b = a.operator;
        break;
      case "<<=":
        b = a.operator;
        break;
      case ">>=":
        b = a.operator;
        break;
      case "|=":
        b = a.operator;
        break;
      case "^=":
        b = a.operator;
        break;
      case "&=":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c;
    c = a.left;
    var e = this[a.right.type](a.right);
    return {type:a.type, operator:b, left:c, right:e};
  };
  b.LogicalExpression = function(a) {
    console.log("LogicalExpression", a);
    var b;
    switch(a.operator) {
      case "||":
        b = a.operator;
        break;
      case "&&":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = this[a.left.type](a.left), e = this[a.right.type](a.right);
    return {type:a.type, operator:b, left:c, right:e};
  };
  b.MemberExpression = function(a) {
    console.log("MemberExpression", a);
    var b = this[a.object.type](a.object), c = this[a.property.type](a.property), e = a.computed;
    console.log("object", b);
    console.log("property", c);
    return {type:a.type, object:b, property:c, computed:e};
  };
  b.ConditionalExpression = function(a) {
    console.log("ConditionalExpression", a);
    var b = this[a.callee.type](a.callee), c;
    for (c in a.arguments) {
      var e = a.arguments[c], e = this[e.type](e);
      (void 0).push(e);
    }
    return {type:a.type, callee:b, arguments:void 0};
  };
  b.CallExpression = function(a) {
    console.log("CallExpression", a);
    var b = this[a.callee.type](a.callee), c = [], e;
    for (e in a.arguments) {
      var f = a.arguments[e], f = this[f.type](f);
      c.push(f);
    }
    console.log("callee", b);
    console.log("arguments", c);
    return {type:a.type, callee:b, arguments:c};
  };
  b.NewExpression = function(a) {
    console.log("NewExpression", a);
    return {type:a.type};
  };
  b.SequenceExpression = function(a) {
    console.log("SequenceExpression", a);
    for (var b in a.expressions) {
      var c = a.expressions[b], c = this[c.type](c);
      (void 0).push(c);
    }
    return {type:a.type, expressions:void 0};
  };
})(Entry.PyToBlockParserTemp.prototype);
Entry.Toast = function() {
  this.toasts_ = [];
  var b = document.getElementById("entryToastContainer");
  b && document.body.removeChild(b);
  this.body_ = Entry.createElement("div", "entryToastContainer");
  this.body_.addClass("entryToastContainer");
  document.body.appendChild(this.body_);
};
Entry.Toast.prototype.warning = function(b, a, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastWarning");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  c.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  c.appendChild(b);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var a = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(a), c.style.display = "none", Entry.removeElement(c));
      c.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.success = function(b, a, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastSuccess");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  c.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  c.appendChild(b);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var a = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(a), c.style.display = "none", Entry.removeElement(c));
      c.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.alert = function(b, a, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastAlert");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  c.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  c.appendChild(b);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var a = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(a), c.style.display = "none", Entry.toast.body_.removeChild(c));
      c.style.opacity *= .9;
    }, 20);
  }, 5E3);
};
Entry.TvCast = function(b) {
  this.generateView(b);
};
p = Entry.TvCast.prototype;
p.init = function(b) {
  this.tvCastHash = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryRemove");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "tvCastIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", b);
  this.movieFrame = a;
  this.movieContainer.appendChild(this.movieFrame);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var b = document.getElementById("tvCastIframe");
  w = this.movieContainer.offsetWidth;
  b.width = w + "px";
  b.height = 9 * w / 16 + "px";
};
Entry.BlockDriver = function() {
};
(function(b) {
  b.convert = function() {
    var a = new Date, b;
    for (b in Entry.block) {
      "function" === typeof Entry.block[b] && this._convertBlock(b);
    }
    console.log((new Date).getTime() - a.getTime());
  };
  b._convertBlock = function(a) {
    function b(a) {
      var c = {type:a.getAttribute("type"), index:{}};
      a = $(a).children();
      if (!a) {
        return c;
      }
      for (var e = 0;e < a.length;e++) {
        var f = a[e], g = f.tagName, h = $(f).children()[0], t = f.getAttribute("name");
        "value" === g ? "block" == h.nodeName && (c.params || (c.params = []), c.params.push(b(h)), c.index[t] = c.params.length - 1) : "field" === g && (c.params || (c.params = []), c.params.push(f.textContent), c.index[t] = c.params.length - 1);
      }
      return c;
    }
    var c = Blockly.Blocks[a], e = EntryStatic.blockInfo[a], f, g;
    if (e && (f = e.class, g = e.isNotFor, e = e.xml)) {
      var e = $.parseXML(e), h = b(e.childNodes[0])
    }
    c = (new Entry.BlockMockup(c, h, a)).toJSON();
    c.class = f;
    c.isNotFor = g;
    _.isEmpty(c.paramsKeyMap) && delete c.paramsKeyMap;
    _.isEmpty(c.statementsKeyMap) && delete c.statementsKeyMap;
    c.func = Entry.block[a];
    -1 < "NUMBER TRUE FALSE TEXT FUNCTION_PARAM_BOOLEAN FUNCTION_PARAM_STRING TRUE_UN".split(" ").indexOf(a.toUpperCase()) && (c.isPrimitive = !0);
    Entry.block[a] = c;
  };
})(Entry.BlockDriver.prototype);
Entry.BlockMockup = function(b, a, d) {
  this.templates = [];
  this.params = [];
  this.statements = [];
  this.color = "";
  this.output = this.isNext = this.isPrev = !1;
  this.fieldCount = 0;
  this.events = {};
  this.def = a || {};
  this.paramsKeyMap = {};
  this.statementsKeyMap = {};
  this.definition = {params:[], type:this.def.type};
  this.simulate(b);
  this.def = this.definition;
};
(function(b) {
  b.simulate = function(a) {
    a.sensorList && (this.sensorList = a.sensorList);
    a.portList && (this.portList = a.portList);
    a.init.call(this);
    a.whenAdd && (this.events.blockViewAdd || (this.events.blockViewAdd = []), this.events.blockViewAdd.push(a.whenAdd));
    a.whenRemove && (this.events.blockViewDestroy || (this.events.blockViewDestroy = []), this.events.blockViewDestroy.push(a.whenRemove));
  };
  b.toJSON = function() {
    function a(b) {
      if (b && (b = b.params)) {
        for (var c = 0;c < b.length;c++) {
          var d = b[c];
          d && (delete d.index, a(d));
        }
      }
    }
    var b = "";
    this.output ? b = "Boolean" === this.output ? "basic_boolean_field" : "basic_string_field" : !this.isPrev && this.isNext ? b = "basic_event" : 1 == this.statements.length ? b = "basic_loop" : 2 == this.statements.length ? b = "basic_double_loop" : this.isPrev && this.isNext ? b = "basic" : this.isPrev && !this.isNext && (b = "basic_without_next");
    a(this.def);
    var c = /dummy_/mi, e;
    for (e in this.paramsKeyMap) {
      c.test(e) && delete this.paramsKeyMap[e];
    }
    for (e in this.statementsKeyMap) {
      c.test(e) && delete this.statementsKeyMap[e];
    }
    return {color:this.color, skeleton:b, statements:this.statements, template:this.templates.filter(function(a) {
      return "string" === typeof a;
    }).join(" "), params:this.params, events:this.events, def:this.def, paramsKeyMap:this.paramsKeyMap, statementsKeyMap:this.statementsKeyMap};
  };
  b.appendDummyInput = function() {
    return this;
  };
  b.appendValueInput = function(a) {
    this.def && this.def.index && (void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(null));
    this.params.push({type:"Block", accept:"string"});
    this._addToParamsKeyMap(a);
    this.templates.push(this.getFieldCount());
    return this;
  };
  b.appendStatementInput = function(a) {
    this._addToStatementsKeyMap(a);
    this.statements.push({accept:"basic"});
  };
  b.setCheck = function(a) {
    var b = this.params;
    "Boolean" === a && (b[b.length - 1].accept = "boolean");
  };
  b.appendField = function(a, b) {
    if (!a) {
      return this;
    }
    "string" === typeof a && 0 < a.length ? b ? (a = {type:"Text", text:a, color:b}, this.params.push(a), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0)) : this.templates.push(a) : a.constructor == Blockly.FieldIcon ? ("start" === a.type ? this.params.push({type:"Indicator", img:a.src_, size:17, position:{x:0, y:-2}}) : 
    this.params.push({type:"Indicator", img:a.src_, size:12}), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.definition && this.definition.params.push(null)) : a.constructor == Blockly.FieldDropdown ? (this.params.push({type:"Dropdown", options:a.menuGenerator_, value:a.menuGenerator_[0][1], fontSize:11}), this._addToParamsKeyMap(b), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : 
    this.definition.params.push(void 0)) : a.constructor == Blockly.FieldDropdownDynamic ? (this.params.push({type:"DropdownDynamic", value:null, menuName:a.menuName_, fontSize:11}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldTextInput ? (this.params.push({type:"TextInput", value:10}), 
    this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldAngle ? (this.params.push({type:"Angle"}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(null), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldKeydownInput ? (this.params.push({type:"Keyboard", value:81}), this.templates.push(this.getFieldCount()), 
    void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldColour ? (this.params.push({type:"Color"}), this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(b)) : console.log("else", a);
    return this;
  };
  b.setColour = function(a) {
    this.color = a;
  };
  b.setInputsInline = function() {
  };
  b.setOutput = function(a, b) {
    a && (this.output = b);
  };
  b.setPreviousStatement = function(a) {
    this.isPrev = a;
  };
  b.setNextStatement = function(a) {
    this.isNext = a;
  };
  b.setEditable = function(a) {
  };
  b.getFieldCount = function() {
    this.fieldCount++;
    return "%" + this.fieldCount;
  };
  b._addToParamsKeyMap = function(a) {
    a = a ? a : "dummy_" + Entry.Utils.generateId();
    var b = this.paramsKeyMap;
    b[a] = Object.keys(b).length;
  };
  b._addToStatementsKeyMap = function(a) {
    a = a ? a : "dummy_" + Entry.Utils.generateId();
    var b = this.statementsKeyMap;
    b[a] = Object.keys(b).length;
  };
})(Entry.BlockMockup.prototype);
Entry.ContextMenu = {};
(function(b) {
  b.visible = !1;
  b._hideEvent = null;
  b.createDom = function() {
    this.dom = Entry.Dom("ul", {id:"entry-contextmenu", parent:$("body")});
    this.dom.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    Entry.Utils.disableContextmenu(this.dom);
  };
  b.show = function(a, b, c) {
    this._hideEvent = Entry.documentMousedown.attach(this, function() {
      this.hide();
    });
    this.dom || this.createDom();
    if (0 !== a.length) {
      var e = this;
      void 0 !== b && (this._className = b, this.dom.addClass(b));
      var f = this.dom;
      f.empty();
      for (var g = 0, h = a.length;g < h;g++) {
        var k = a[g], l = k.text, m = !1 !== k.enable, n = Entry.Dom("li", {parent:f});
        k.divider ? b = "divider" : (b = m ? "menuAble" : "menuDisable", Entry.Dom("span", {parent:n}).text(l), m && k.callback && function(a, b) {
          a.mousedown(function(a) {
            a.preventDefault();
            e.hide();
            b(a);
          });
        }(n, k.callback));
        n.addClass(b);
      }
      f.removeClass("entryRemove");
      this.visible = !0;
      this.position(c || Entry.mouseCoordinate);
    }
  };
  b.position = function(a) {
    var b = this.dom;
    b.css({left:0, top:0});
    var c = b.width(), e = b.height(), f = $(window), g = f.width(), f = f.height();
    a.x + c > g && (a.x -= c + 3);
    a.y + e > f && (a.y -= e);
    b.css({left:a.x, top:a.y});
  };
  b.hide = function() {
    this.visible = !1;
    this.dom.empty();
    this.dom.addClass("entryRemove");
    this._className && (this.dom.removeClass(this._className), delete this._className);
    this._hideEvent && (Entry.documentMousedown.detach(this._hideEvent), this._hideEvent = null);
  };
})(Entry.ContextMenu);
Entry.Loader = {queueCount:0, totalCount:0, loaded:!1};
Entry.Loader.addQueue = function(b) {
  this.queueCount || Entry.dispatchEvent("loadStart");
  this.queueCount++;
  this.totalCount++;
};
Entry.Loader.removeQueue = function(b) {
  this.queueCount--;
  this.queueCount || (this.totalCount = 0, this.handleLoad());
};
Entry.Loader.getLoadedPercent = function() {
  return 0 === this.totalCount ? 1 : this.queueCount / this.totalCount;
};
Entry.Loader.isLoaded = function() {
  return !this.queueCount && !this.totalCount;
};
Entry.Loader.handleLoad = function() {
  this.loaded || (this.loaded = !0, Entry.dispatchEvent("loadComplete"));
};
Entry.STATIC = {OBJECT:0, ENTITY:1, SPRITE:2, SOUND:3, VARIABLE:4, FUNCTION:5, SCENE:6, MESSAGE:7, BLOCK_MODEL:8, BLOCK_RENDER_MODEL:9, BOX_MODEL:10, THREAD_MODEL:11, DRAG_INSTANCE:12, BLOCK_STATIC:0, BLOCK_MOVE:1, BLOCK_FOLLOW:2, RETURN:0, CONTINUE:1, BREAK:2, PASS:3, COMMAND_TYPES:{addThread:101, destroyThread:102, destroyBlock:103, recoverBlock:104, insertBlock:105, separateBlock:106, moveBlock:107, cloneBlock:108, uncloneBlock:109, scrollBoard:110, setFieldValue:111, selectObject:201, "do":301, 
undo:302, redo:303, editPicture:401, uneditPicture:402, processPicture:403, unprocessPicture:404}};
Entry.Command = {};
(function(b) {
  b.do = {type:Entry.STATIC.COMMAND_TYPES["do"], log:function(a) {
    return [b["do"].type];
  }};
  b.undo = {type:Entry.STATIC.COMMAND_TYPES.undo, log:function(a) {
    return [b.undo.type];
  }};
  b.redo = {type:Entry.STATIC.COMMAND_TYPES.redo, log:function(a) {
    return [b.redo.type];
  }};
})(Entry.Command);
Entry.Commander = function(b) {
  if ("workspace" == b || "phone" == b) {
    Entry.stateManager = new Entry.StateManager;
  }
  Entry.do = this.do.bind(this);
  Entry.undo = this.undo.bind(this);
  this.editor = {};
  this.reporters = [];
  this._tempStorage = null;
  Entry.Command.editor = this.editor;
};
(function(b) {
  b.do = function(a) {
    var b = this, c = Array.prototype.slice.call(arguments);
    c.shift();
    var e = Entry.Command[a];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [a, this, this.do, e.undo].concat(e.state.apply(this, c)));
    e = Entry.Command[a].do.apply(this, c);
    setTimeout(function() {
      b.report("do");
      b.report(a, c);
    }, 0);
    return {value:e, isPass:this.isPass.bind(this)};
  };
  b.undo = function() {
    var a = Array.prototype.slice.call(arguments), b = a.shift(), c = Entry.Command[b];
    this.report("undo");
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.do, c.undo].concat(c.state.apply(this, a)));
    return {value:Entry.Command[b].do.apply(this, a), isPass:this.isPass.bind(this)};
  };
  b.redo = function() {
    var a = Array.prototype.slice.call(arguments), b = a.shift(), c = Entry.Command[b];
    that.report("redo");
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.undo, b].concat(c.state.apply(null, a)));
    c.undo.apply(this, a);
  };
  b.setCurrentEditor = function(a, b) {
    this.editor[a] = b;
  };
  b.isPass = function(a) {
    a = void 0 === a ? !0 : a;
    if (Entry.stateManager) {
      var b = Entry.stateManager.getLastCommand();
      b && (b.isPass = a);
    }
  };
  b.addReporter = function(a) {
    this.reporters.push(a);
  };
  b.removeReporter = function(a) {
    a = this.reporters.indexOf(a);
    -1 < a && this.reporters.splice(a, 1);
  };
  b.report = function(a, b) {
    var c = this.reporters;
    if (0 !== c.length) {
      var e;
      e = a && Entry.Command[a] && Entry.Command[a].log ? Entry.Command[a].log.apply(this, b) : b;
      c.forEach(function(a) {
        a.add(e);
      });
    }
  };
})(Entry.Commander.prototype);
(function(b) {
  b.addThread = {type:Entry.STATIC.COMMAND_TYPES.addThread, do:function(a) {
    return this.editor.board.code.createThread(a);
  }, state:function(a) {
    a.length && (a[0].id = Entry.Utils.generateId());
    return [a];
  }, log:function(a) {
    a = this.editor.board.code.getThreads().pop();
    return [b.addThread.type, ["thread", a.stringify()], ["code", this.editor.board.code.stringify()]];
  }, undo:"destroyThread"};
  b.destroyThread = {type:Entry.STATIC.COMMAND_TYPES.destroyThread, do:function(a) {
    this.editor.board.findById(a[0].id).destroy(!0, !0);
  }, state:function(a) {
    return [this.editor.board.findById(a[0].id).thread.toJSON()];
  }, log:function(a) {
    a = a[0].id;
    this.editor.board.findById(a);
    return [b.destroyThread.type, ["blockId", a], ["code", this.editor.board.code.stringify()]];
  }, undo:"addThread"};
  b.destroyBlock = {type:Entry.STATIC.COMMAND_TYPES.destroyBlock, do:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    a.doDestroy(!0);
  }, state:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [a.toJSON(), a.pointer()];
  }, log:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [b.destroyBlock.type, ["blockId", a.id], ["code", this.editor.board.code.stringify()]];
  }, undo:"recoverBlock"};
  b.recoverBlock = {type:Entry.STATIC.COMMAND_TYPES.recoverBlock, do:function(a, b) {
    var c = this.editor.board.code.createThread([a]).getFirstBlock();
    "string" === typeof c && (c = this.editor.board.findById(c));
    this.editor.board.insert(c, b);
  }, state:function(a) {
    "string" !== typeof a && (a = a.id);
    return [a];
  }, log:function(a, d) {
    a = this.editor.board.findById(a.id);
    return [b.recoverBlock.type, ["block", a.stringify()], ["pointer", d], ["code", this.editor.board.code.stringify()]];
  }, undo:"destroyBlock"};
  b.insertBlock = {type:Entry.STATIC.COMMAND_TYPES.insertBlock, do:function(a, b, c) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    this.editor.board.insert(a, b, c);
  }, state:function(a, b) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    var c = [a.id], e = a.targetPointer();
    c.push(e);
    "string" !== typeof a && "basic" === a.getBlockType() && c.push(a.thread.getCount(a));
    return c;
  }, log:function(a, d, c) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [b.insertBlock.type, ["blockId", a.id], ["targetPointer", a.targetPointer()], ["count", c], ["code", this.editor.board.code.stringify()]];
  }, undo:"insertBlock"};
  b.separateBlock = {type:Entry.STATIC.COMMAND_TYPES.separateBlock, do:function(a) {
    a.view && a.view._toGlobalCoordinate(Entry.DRAG_MODE_DRAG);
    a.doSeparate();
  }, state:function(a) {
    var b = [a.id], c = a.targetPointer();
    b.push(c);
    "basic" === a.getBlockType() && b.push(a.thread.getCount(a));
    return b;
  }, log:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [b.separateBlock.type, ["blockId", a.id], ["x", a.x], ["y", a.y], ["code", this.editor.board.code.stringify()]];
  }, undo:"insertBlock"};
  b.moveBlock = {type:Entry.STATIC.COMMAND_TYPES.moveBlock, do:function(a, b, c) {
    void 0 !== b ? (a = this.editor.board.findById(a), a.moveTo(b, c)) : a._updatePos();
  }, state:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [a.id, a.x, a.y];
  }, log:function(a, d, c) {
    return [b.moveBlock.type, ["blockId", a.id], ["x", a.x], ["y", a.y], ["code", this.editor.board.code.stringify()]];
  }, undo:"moveBlock"};
  b.cloneBlock = {type:Entry.STATIC.COMMAND_TYPES.cloneBlock, do:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    this.editor.board.code.createThread(a.copy());
  }, state:function(a) {
    "string" !== typeof a && (a = a.id);
    return [a];
  }, log:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    var d = this.editor.board.code.getThreads().pop();
    return [b.cloneBlock.type, ["blockId", a.id], ["thread", d.stringify()], ["code", this.editor.board.code.stringify()]];
  }, undo:"uncloneBlock"};
  b.uncloneBlock = {type:Entry.STATIC.COMMAND_TYPES.uncloneBlock, do:function(a) {
    a = this.editor.board.code.getThreads().pop().getFirstBlock();
    this._tempStorage = a.id;
    a.destroy(!0, !0);
  }, state:function(a) {
    return [a];
  }, log:function(a) {
    a = this._tempStorage;
    this._tempStorage = null;
    return [b.uncloneBlock.type, ["blockId", a], ["code", this.editor.board.code.stringify()]];
  }, undo:"cloneBlock"};
  b.scrollBoard = {type:Entry.STATIC.COMMAND_TYPES.scrollBoard, do:function(a, b, c) {
    c || this.editor.board.scroller._scroll(a, b);
    delete this.editor.board.scroller._diffs;
  }, state:function(a, b) {
    return [-a, -b];
  }, log:function(a, d) {
    return [b.scrollBoard.type, ["dx", a], ["dy", d]];
  }, undo:"scrollBoard"};
  b.setFieldValue = {type:Entry.STATIC.COMMAND_TYPES.setFieldValue, do:function(a, b, c, e, f) {
    b.setValue(f, !0);
  }, state:function(a, b, c, e, f) {
    return [a, b, c, f, e];
  }, log:function(a, d, c, e, f) {
    return [b.setFieldValue.type, ["pointer", c], ["newValue", f], ["code", this.editor.board.code.stringify()]];
  }, undo:"setFieldValue"};
})(Entry.Command);
(function(b) {
  b.selectObject = {type:Entry.STATIC.COMMAND_TYPES.selectObject, do:function(a) {
    return Entry.container.selectObject(a);
  }, state:function(a) {
    if ((a = Entry.playground) && a.object) {
      return [a.object.id];
    }
  }, log:function(a) {
    return [a];
  }, undo:"selectObject"};
})(Entry.Command);
(function(b) {
  b.editPicture = {type:Entry.STATIC.COMMAND_TYPES.editPicture, do:function(a, b) {
    Entry.playground.painter.lc.canRedo() && Entry.playground.painter.lc.redo();
  }, state:function(a) {
  }, log:function(a) {
    return [a];
  }, undo:"uneditPicture"};
  b.uneditPicture = {type:Entry.STATIC.COMMAND_TYPES.uneditPicture, do:function(a, b) {
    Entry.playground.painter.lc.undo();
  }, state:function(a) {
  }, log:function(a) {
    return [a];
  }, undo:"editPicture"};
  b.processPicture = {type:Entry.STATIC.COMMAND_TYPES.processPicture, do:function(a, b) {
    Entry.playground.painter.lc.canRedo() && Entry.playground.painter.lc.redo();
  }, state:function(a) {
  }, log:function(a) {
    return [a];
  }, undo:"unprocessPicture", isPass:!0};
  b.unprocessPicture = {type:Entry.STATIC.COMMAND_TYPES.unprocessPicture, do:function(a, b) {
    Entry.playground.painter.lc.undo();
  }, state:function(a) {
  }, log:function(a) {
    return [a];
  }, undo:"processPicture", isPass:!0};
})(Entry.Command);
Entry.init = function(b, a) {
  Entry.assert("object" === typeof a, "Init option is not object");
  this.events_ = {};
  this.interfaceState = {menuWidth:264};
  Entry.Utils.bindGlobalEvent("resize mousedown mousemove keydown keyup dispose".split(" "));
  this.options = a;
  this.parseOptions(a);
  this.mediaFilePath = (a.libDir ? a.libDir : "/lib") + "/entryjs/images/";
  this.defaultPath = a.defaultDir || "";
  this.blockInjectPath = a.blockInjectDir || "";
  "workspace" == this.type && this.isPhone() && (this.type = "phone");
  this.initialize_();
  this.view_ = b;
  $(this.view_).addClass("entry");
  "tablet" === this.device && $(this.view_).addClass("tablet");
  Entry.initFonts(a.fonts);
  this.createDom(b, this.type);
  this.loadInterfaceState();
  this.overridePrototype();
  this.maxCloneLimit = 302;
  this.cloudSavable = !0;
  this.startTime = (new Date).getTime();
  document.onkeydown = function(a) {
    Entry.dispatchEvent("keyPressed", a);
  };
  document.onkeyup = function(a) {
    Entry.dispatchEvent("keyUpped", a);
  };
  window.onresize = function(a) {
    Entry.dispatchEvent("windowResized", a);
  };
  window.onbeforeunload = this.beforeUnload;
  Entry.addEventListener("saveWorkspace", function(a) {
    Entry.addActivity("save");
  });
  Entry.addEventListener("showBlockHelper", function(a) {
    Entry.propertyPanel.select("helper");
  });
  "IE" != Entry.getBrowserType().substr(0, 2) || window.flashaudio ? createjs.Sound.registerPlugins([createjs.WebAudioPlugin]) : (createjs.FlashAudioPlugin.swfPath = this.mediaFilePath + "media/", createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]), window.flashaudio = !0);
  Entry.soundQueue = new createjs.LoadQueue;
  Entry.soundQueue.installPlugin(createjs.Sound);
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/click.mp3", Entry.mediaFilePath + "sounds/click.wav", Entry.mediaFilePath + "sounds/click.ogg"], "entryMagneting");
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/delete.mp3", Entry.mediaFilePath + "sounds/delete.ogg", Entry.mediaFilePath + "sounds/delete.wav"], "entryDelete");
  createjs.Sound.stop();
};
Entry.changeContainer = function(b) {
  b.appendChild(this.view_);
};
Entry.loadAudio_ = function(b, a) {
  if (window.Audio && b.length) {
    for (;0 < b.length;) {
      var d = b[0];
      d.match(/\/([^.]+)./);
      Entry.soundQueue.loadFile({id:a, src:d, type:createjs.LoadQueue.SOUND});
      break;
    }
  }
};
Entry.initialize_ = function() {
  this.stage = new Entry.Stage;
  Entry.engine && Entry.engine.clearTimer();
  this.engine = new Entry.Engine;
  this.propertyPanel = new Entry.PropertyPanel;
  this.container = new Entry.Container;
  this.helper = new Entry.Helper;
  this.youtube = new Entry.Youtube;
  this.variableContainer = new Entry.VariableContainer;
  this.commander = new Entry.Commander(this.type);
  this.scene = new Entry.Scene;
  this.playground = new Entry.Playground;
  this.toast = new Entry.Toast;
  this.hw && this.hw.closeConnection();
  this.hw = new Entry.HW;
  if (Entry.enableActivityLogging) {
    this.reporter = new Entry.Reporter(!1);
  } else {
    if ("workspace" == this.type || "phone" == this.type) {
      this.reporter = new Entry.Reporter(!0);
    }
  }
};
Entry.createDom = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (d = Entry.createElement("canvas"), d.className = "entryCanvasWorkspace", d.id = "entryCanvas", d.width = 640, d.height = 360, c = Entry.createElement("div", "entryCanvasWrapper"), c.appendChild(d), b.appendChild(c), this.canvas_ = d, this.stage.initStage(this.canvas_), c = Entry.createElement("div"), b.appendChild(c), this.engineView = c, this.engine.generateView(this.engineView, a)) : "phone" == a && (this.stateManagerView = d = Entry.createElement("div"), this.stateManager.generateView(this.stateManagerView, 
    a), c = Entry.createElement("div"), b.appendChild(c), this.engineView = c, this.engine.generateView(this.engineView, a), d = Entry.createElement("canvas"), d.addClass("entryCanvasPhone"), d.id = "entryCanvas", d.width = 640, d.height = 360, c.insertBefore(d, this.engine.footerView_), this.canvas_ = d, this.stage.initStage(this.canvas_), d = Entry.createElement("div"), b.appendChild(d), this.containerView = d, this.container.generateView(this.containerView, a), d = Entry.createElement("div"), 
    b.appendChild(d), this.playgroundView = d, this.playground.generateView(this.playgroundView, a));
  } else {
    Entry.documentMousedown.attach(this, this.cancelObjectEdit);
    var d = Entry.createElement("div");
    b.appendChild(d);
    this.sceneView = d;
    this.scene.generateView(this.sceneView, a);
    d = Entry.createElement("div");
    this.sceneView.appendChild(d);
    this.stateManagerView = d;
    this.stateManager.generateView(this.stateManagerView, a);
    var c = Entry.createElement("div");
    b.appendChild(c);
    this.engineView = c;
    this.engine.generateView(this.engineView, a);
    d = Entry.createElement("canvas");
    d.addClass("entryCanvasWorkspace");
    d.id = "entryCanvas";
    d.width = 640;
    d.height = 360;
    c.insertBefore(d, this.engine.addButton);
    d.addEventListener("mousewheel", function(a) {
      var b = Entry.variableContainer.getListById(Entry.stage.mouseCoordinate);
      a = 0 < a.wheelDelta ? !0 : !1;
      for (var c = 0;c < b.length;c++) {
        var d = b[c];
        d.scrollButton_.y = a ? 46 <= d.scrollButton_.y ? d.scrollButton_.y - 23 : 23 : d.scrollButton_.y + 23;
        d.updateView();
      }
    });
    this.canvas_ = d;
    this.stage.initStage(this.canvas_);
    d = Entry.createElement("div");
    this.propertyPanel.generateView(b, a);
    this.containerView = d;
    this.container.generateView(this.containerView, a);
    this.propertyPanel.addMode("object", this.container);
    this.helper.generateView(this.containerView, a);
    this.propertyPanel.addMode("helper", this.helper);
    d = Entry.createElement("div");
    b.appendChild(d);
    this.playgroundView = d;
    this.playground.generateView(this.playgroundView, a);
    this.propertyPanel.select("object");
    this.helper.bindWorkspace(this.playground.mainWorkspace);
  }
};
Entry.start = function(b) {
  "invisible" !== Entry.type && (this.FPS || (this.FPS = 60), Entry.assert("number" == typeof this.FPS, "FPS must be number"), Entry.engine.start(this.FPS));
};
Entry.stop = function() {
  "invisible" !== Entry.type && (this.FPS = null, Entry.engine.stop());
};
Entry.parseOptions = function(b) {
  this.type = b.type;
  b.device && (this.device = b.device);
  this.projectSaveable = b.projectsaveable;
  void 0 === this.projectSaveable && (this.projectSaveable = !0);
  this.objectAddable = b.objectaddable;
  void 0 === this.objectAddable && (this.objectAddable = !0);
  this.objectEditable = b.objectEditable;
  void 0 === this.objectEditable && (this.objectEditable = !0);
  this.objectEditable || (this.objectAddable = !1);
  this.objectDeletable = b.objectdeletable;
  void 0 === this.objectDeletable && (this.objectDeletable = !0);
  this.soundEditable = b.soundeditable;
  void 0 === this.soundEditable && (this.soundEditable = !0);
  this.pictureEditable = b.pictureeditable;
  void 0 === this.pictureEditable && (this.pictureEditable = !0);
  this.sceneEditable = b.sceneEditable;
  void 0 === this.sceneEditable && (this.sceneEditable = !0);
  this.functionEnable = b.functionEnable;
  void 0 === this.functionEnable && (this.functionEnable = !0);
  this.messageEnable = b.messageEnable;
  void 0 === this.messageEnable && (this.messageEnable = !0);
  this.variableEnable = b.variableEnable;
  void 0 === this.variableEnable && (this.variableEnable = !0);
  this.listEnable = b.listEnable;
  void 0 === this.listEnable && (this.listEnable = !0);
  this.hasVariableManager = b.hasvariablemanager;
  this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable ? void 0 === this.hasVariableManager && (this.hasVariableManager = !0) : this.hasVariableManager = !1;
  this.isForLecture = b.isForLecture;
};
Entry.initFonts = function(b) {
  this.fonts = b;
  b || (this.fonts = []);
};
Entry.Utils = {};
Entry.overridePrototype = function() {
  Number.prototype.mod = function(b) {
    return (this % b + b) % b;
  };
};
Entry.Utils.generateId = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.Utils.intersectArray = function(b, a) {
  for (var d = [], c = 0;c < b.length;c++) {
    for (var e = 0;e < a.length;e++) {
      if (b[c] == a[e]) {
        d.push(b[c]);
        break;
      }
    }
  }
  return d;
};
Entry.Utils.isPointInMatrix = function(b, a, d) {
  d = void 0 === d ? 0 : d;
  var c = b.offsetX ? b.x + b.offsetX : b.x, e = b.offsetY ? b.y + b.offsety : b.y;
  return c - d <= a.x && c + b.width + d >= a.x && e - d <= a.y && e + b.height + d >= a.y;
};
Entry.Utils.colorDarken = function(b, a) {
  function d(a) {
    2 != a.length && (a = "0" + a);
    return a;
  }
  var c, e, f;
  7 === b.length ? (c = parseInt(b.substr(1, 2), 16), e = parseInt(b.substr(3, 2), 16), f = parseInt(b.substr(5, 2), 16)) : (c = parseInt(b.substr(1, 2), 16), e = parseInt(b.substr(2, 2), 16), f = parseInt(b.substr(3, 2), 16));
  a = void 0 === a ? .7 : a;
  c = d(Math.floor(c * a).toString(16));
  e = d(Math.floor(e * a).toString(16));
  f = d(Math.floor(f * a).toString(16));
  return "#" + c + e + f;
};
Entry.Utils.colorLighten = function(b, a) {
  a = 0 === a ? 0 : a || 20;
  var d = Entry.Utils.hexToHsl(b);
  d.l += a / 100;
  d.l = Math.min(1, Math.max(0, d.l));
  return Entry.Utils.hslToHex(d);
};
Entry.Utils.bound01 = function(b, a) {
  var d = b;
  "string" == typeof d && -1 != d.indexOf(".") && 1 === parseFloat(d) && (b = "100%");
  d = "string" === typeof b && -1 != b.indexOf("%");
  b = Math.min(a, Math.max(0, parseFloat(b)));
  d && (b = parseInt(b * a, 10) / 100);
  return 1E-6 > Math.abs(b - a) ? 1 : b % a / parseFloat(a);
};
Entry.Utils.hexToHsl = function(b) {
  var a, d;
  7 === b.length ? (a = parseInt(b.substr(1, 2), 16), d = parseInt(b.substr(3, 2), 16), b = parseInt(b.substr(5, 2), 16)) : (a = parseInt(b.substr(1, 2), 16), d = parseInt(b.substr(2, 2), 16), b = parseInt(b.substr(3, 2), 16));
  a = Entry.Utils.bound01(a, 255);
  d = Entry.Utils.bound01(d, 255);
  b = Entry.Utils.bound01(b, 255);
  var c = Math.max(a, d, b), e = Math.min(a, d, b), f, g = (c + e) / 2;
  if (c == e) {
    f = e = 0;
  } else {
    var h = c - e, e = .5 < g ? h / (2 - c - e) : h / (c + e);
    switch(c) {
      case a:
        f = (d - b) / h + (d < b ? 6 : 0);
        break;
      case d:
        f = (b - a) / h + 2;
        break;
      case b:
        f = (a - d) / h + 4;
    }
    f /= 6;
  }
  return {h:360 * f, s:e, l:g};
};
Entry.Utils.hslToHex = function(b) {
  function a(a, b, c) {
    0 > c && (c += 1);
    1 < c && --c;
    return c < 1 / 6 ? a + 6 * (b - a) * c : .5 > c ? b : c < 2 / 3 ? a + (b - a) * (2 / 3 - c) * 6 : a;
  }
  function d(a) {
    return 1 == a.length ? "0" + a : "" + a;
  }
  var c, e;
  e = Entry.Utils.bound01(b.h, 360);
  c = Entry.Utils.bound01(b.s, 1);
  b = Entry.Utils.bound01(b.l, 1);
  if (0 === c) {
    c = b = e = b;
  } else {
    var f = .5 > b ? b * (1 + c) : b + c - b * c, g = 2 * b - f;
    c = a(g, f, e + 1 / 3);
    b = a(g, f, e);
    e = a(g, f, e - 1 / 3);
  }
  b *= 255;
  e *= 255;
  return "#" + [d(Math.round(255 * c).toString(16)), d(Math.round(b).toString(16)), d(Math.round(e).toString(16))].join("");
};
Entry.Utils.bindGlobalEvent = function(b) {
  var a = $(document);
  void 0 === b && (b = "resize mousedown mousemove keydown keyup dispose".split(" "));
  -1 < b.indexOf("resize") && (Entry.windowReszied && ($(window).off("resize"), Entry.windowReszied.clear()), Entry.windowResized = new Entry.Event(window), $(window).on("resize", function(a) {
    Entry.windowResized.notify(a);
  }));
  -1 < b.indexOf("mousedown") && (Entry.documentMousedown && (a.off("mousedown"), Entry.documentMousedown.clear()), Entry.documentMousedown = new Entry.Event(window), a.on("mousedown", function(a) {
    Entry.documentMousedown.notify(a);
  }));
  -1 < b.indexOf("mousemove") && (Entry.documentMousemove && (a.off("touchmove mousemove"), Entry.documentMousemove.clear()), Entry.mouseCoordinate = {}, Entry.documentMousemove = new Entry.Event(window), a.on("touchmove mousemove", function(a) {
    a.originalEvent && a.originalEvent.touches && (a = a.originalEvent.touches[0]);
    Entry.documentMousemove.notify(a);
    Entry.mouseCoordinate.x = a.clientX;
    Entry.mouseCoordinate.y = a.clientY;
  }));
  -1 < b.indexOf("keydown") && (Entry.keyPressed && (a.off("keydown"), Entry.keyPressed.clear()), Entry.pressedKeys = [], Entry.keyPressed = new Entry.Event(window), a.on("keydown", function(a) {
    var b = a.keyCode;
    0 > Entry.pressedKeys.indexOf(b) && Entry.pressedKeys.push(b);
    Entry.keyPressed.notify(a);
  }));
  -1 < b.indexOf("keyup") && (Entry.keyUpped && (a.off("keyup"), Entry.keyUpped.clear()), Entry.keyUpped = new Entry.Event(window), a.on("keyup", function(a) {
    var b = Entry.pressedKeys.indexOf(a.keyCode);
    -1 < b && Entry.pressedKeys.splice(b, 1);
    Entry.keyUpped.notify(a);
  }));
  -1 < b.indexOf("dispose") && (Entry.disposeEvent && Entry.disposeEvent.clear(), Entry.disposeEvent = new Entry.Event(window), Entry.documentMousedown && Entry.documentMousedown.attach(this, function(a) {
    Entry.disposeEvent.notify(a);
  }));
};
Entry.Utils.makeActivityReporter = function() {
  Entry.activityReporter = new Entry.ActivityReporter;
  Entry.commander && Entry.commander.addReporter(Entry.activityReporter);
  return Entry.activityReporter;
};
Entry.Utils.initEntryEvent_ = function() {
  Entry.events_ || (Entry.events_ = []);
};
Entry.sampleColours = [];
Entry.assert = function(b, a) {
  if (!b) {
    throw Error(a || "Assert failed");
  }
};
Entry.parseTexttoXML = function(b) {
  var a;
  window.ActiveXObject ? (a = new ActiveXObject("Microsoft.XMLDOM"), a.async = "false", a.loadXML(b)) : a = (new DOMParser).parseFromString(b, "text/xml");
  return a;
};
Entry.createElement = function(b, a) {
  var d;
  d = b instanceof HTMLElement ? b : document.createElement(b);
  a && (d.id = a);
  d.hasClass = function(a) {
    return this.className.match(new RegExp("(\\s|^)" + a + "(\\s|$)"));
  };
  d.addClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) || (this.className += " " + a);
    }
  };
  d.removeClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) && (this.className = this.className.replace(new RegExp("(\\s|^)" + a + "(\\s|$)"), " "));
    }
  };
  d.bindOnClick = function(a) {
    $(this).on("click tab", function(b) {
      b.stopImmediatePropagation();
      a.call(this, b);
    });
  };
  return d;
};
Entry.makeAutolink = function(b) {
  return b ? b.replace(/(http|https|ftp|telnet|news|irc):\/\/([-/.a-zA-Z0-9_~#%$?&=:200-377()][^)\]}]+)/gi, "<a href='$1://$2' target='_blank'>$1://$2</a>").replace(/([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+.[a-z0-9-]+)/gi, "<a href='mailto:$1'>$1</a>") : "";
};
Entry.generateHash = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.addEventListener = function(b, a) {
  this.events_ || (this.events_ = {});
  this.events_[b] || (this.events_[b] = []);
  a instanceof Function && this.events_[b].push(a);
  return !0;
};
Entry.dispatchEvent = function(b, a) {
  this.events_ || (this.events_ = {});
  if (this.events_[b]) {
    for (var d = 0, c = this.events_[b].length;d < c;d++) {
      this.events_[b][d].call(window, a);
    }
  }
};
Entry.removeEventListener = function(b, a) {
  if (this.events_[b]) {
    for (var d = 0, c = this.events_[b].length;d < c;d++) {
      if (this.events_[b][d] === a) {
        this.events_[b].splice(d, 1);
        break;
      }
    }
  }
};
Entry.removeAllEventListener = function(b) {
  this.events_ && this.events_[b] && delete this.events_[b];
};
Entry.addTwoNumber = function(b, a) {
  if (isNaN(b) || isNaN(a)) {
    return b + a;
  }
  b += "";
  a += "";
  var d = b.indexOf("."), c = a.indexOf("."), e = 0, f = 0;
  0 < d && (e = b.length - d - 1);
  0 < c && (f = a.length - c - 1);
  return 0 < e || 0 < f ? e >= f ? (parseFloat(b) + parseFloat(a)).toFixed(e) : (parseFloat(b) + parseFloat(a)).toFixed(f) : parseInt(b) + parseInt(a);
};
Entry.hex2rgb = function(b) {
  return (b = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(b)) ? {r:parseInt(b[1], 16), g:parseInt(b[2], 16), b:parseInt(b[3], 16)} : null;
};
Entry.rgb2hex = function(b, a, d) {
  return "#" + (16777216 + (b << 16) + (a << 8) + d).toString(16).slice(1);
};
Entry.generateRgb = function() {
  return {r:Math.floor(256 * Math.random()), g:Math.floor(256 * Math.random()), b:Math.floor(256 * Math.random())};
};
Entry.adjustValueWithMaxMin = function(b, a, d) {
  return b > d ? d : b < a ? a : b;
};
Entry.isExist = function(b, a, d) {
  for (var c = 0;c < d.length;c++) {
    if (d[c][a] == b) {
      return d[c];
    }
  }
  return !1;
};
Entry.getColourCodes = function() {
  return "transparent #660000 #663300 #996633 #003300 #003333 #003399 #000066 #330066 #660066 #FFFFFF #990000 #993300 #CC9900 #006600 #336666 #0033FF #000099 #660099 #990066 #000000 #CC0000 #CC3300 #FFCC00 #009900 #006666 #0066FF #0000CC #663399 #CC0099 #333333 #FF0000 #FF3300 #FFFF00 #00CC00 #009999 #0099FF #0000FF #9900CC #FF0099 #666666 #CC3333 #FF6600 #FFFF33 #00FF00 #00CCCC #00CCFF #3366FF #9933FF #FF00FF #999999 #FF6666 #FF6633 #FFFF66 #66FF66 #66CCCC #00FFFF #3399FF #9966FF #FF66FF #BBBBBB #FF9999 #FF9966 #FFFF99 #99FF99 #66FFCC #99FFFF #66CCff #9999FF #FF99FF #CCCCCC #FFCCCC #FFCC99 #FFFFCC #CCFFCC #99FFCC #CCFFFF #99CCFF #CCCCFF #FFCCFF".split(" ");
};
Entry.removeElement = function(b) {
  b && b.parentNode && b.parentNode.removeChild(b);
};
Entry.getElementsByClassName = function(b) {
  for (var a = [], d = document.getElementsByTagName("*"), c = 0;c < d.length;c++) {
    -1 < (" " + d[c].className + " ").indexOf(" " + b + " ") && a.push(d[c]);
  }
  return a;
};
Entry.parseNumber = function(b) {
  return "string" != typeof b || isNaN(Number(b)) ? "number" != typeof b || isNaN(Number(b)) ? !1 : b : Number(b);
};
Entry.countStringLength = function(b) {
  var a, d = 0;
  for (a = 0;a < b.length;a++) {
    255 < b.charCodeAt(a) ? d += 2 : d++;
  }
  return d;
};
Entry.cutStringByLength = function(b, a) {
  var d, c = 0;
  for (d = 0;c < a && d < b.length;d++) {
    255 < b.charCodeAt(d) ? c += 2 : c++;
  }
  return b.substr(0, d);
};
Entry.isChild = function(b, a) {
  if (!a) {
    for (;a.parentNode;) {
      if ((a = a.parentNode) == b) {
        return !0;
      }
    }
  }
  return !1;
};
Entry.launchFullScreen = function(b) {
  b.requestFullscreen ? b.requestFullscreen() : b.mozRequestFulScreen ? b.mozRequestFulScreen() : b.webkitRequestFullscreen ? b.webkitRequestFullscreen() : b.msRequestFullScreen && b.msRequestFullScreen();
};
Entry.exitFullScreen = function() {
  document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
};
Entry.isPhone = function() {
  return !1;
};
Entry.getKeyCodeMap = function() {
  return {65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 32:Lang.Blocks.START_press_some_key_space, 37:Lang.Blocks.START_press_some_key_left, 38:Lang.Blocks.START_press_some_key_up, 39:Lang.Blocks.START_press_some_key_right, 40:Lang.Blocks.START_press_some_key_down, 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
  13:Lang.Blocks.START_press_some_key_enter};
};
Entry.checkCollisionRect = function(b, a) {
  return !(b.y + b.height < a.y || b.y > a.y + a.height || b.x + b.width < a.x || b.x > a.x + a.width);
};
Entry.bindAnimationCallback = function(b, a) {
  b.addEventListener("webkitAnimationEnd", a, !1);
  b.addEventListener("animationend", a, !1);
  b.addEventListener("oanimationend", a, !1);
};
Entry.cloneSimpleObject = function(b) {
  var a = {}, d;
  for (d in b) {
    a[d] = b[d];
  }
  return a;
};
Entry.nodeListToArray = function(b) {
  for (var a = Array(b.length), d = -1, c = b.length;++d !== c;a[d] = b[d]) {
  }
  return a;
};
Entry.computeInputWidth = function(b) {
  var a = document.createElement("span");
  a.className = "tmp-element";
  a.innerHTML = b.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  document.body.appendChild(a);
  b = a.offsetWidth;
  document.body.removeChild(a);
  return Number(b + 10) + "px";
};
Entry.isArrowOrBackspace = function(b) {
  return -1 < [37, 38, 39, 40, 8].indexOf(b);
};
Entry.hexStringToBin = function(b) {
  for (var a = [], d = 0;d < b.length - 1;d += 2) {
    a.push(parseInt(b.substr(d, 2), 16));
  }
  return String.fromCharCode.apply(String, a);
};
Entry.findObjsByKey = function(b, a, d) {
  for (var c = [], e = 0;e < b.length;e++) {
    b[e][a] == d && c.push(b[e]);
  }
  return c;
};
Entry.factorials = [];
Entry.factorial = function(b) {
  return 0 === b || 1 == b ? 1 : 0 < Entry.factorials[b] ? Entry.factorials[b] : Entry.factorials[b] = Entry.factorial(b - 1) * b;
};
Entry.getListRealIndex = function(b, a) {
  if (isNaN(b)) {
    switch(b) {
      case "FIRST":
        b = 1;
        break;
      case "LAST":
        b = a.array_.length;
        break;
      case "RANDOM":
        b = Math.floor(Math.random() * a.array_.length) + 1;
    }
  }
  return b;
};
Entry.toRadian = function(b) {
  return b * Math.PI / 180;
};
Entry.toDegrees = function(b) {
  return 180 * b / Math.PI;
};
Entry.getPicturesJSON = function(b) {
  for (var a = [], d = 0, c = b.length;d < c;d++) {
    var e = b[d], f = {};
    f._id = e._id;
    f.id = e.id;
    f.dimension = e.dimension;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    f.scale = e.scale;
    a.push(f);
  }
  return a;
};
Entry.getSoundsJSON = function(b) {
  for (var a = [], d = 0, c = b.length;d < c;d++) {
    var e = b[d], f = {};
    f._id = e._id;
    f.duration = e.duration;
    f.ext = e.ext;
    f.id = e.id;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    a.push(f);
  }
  return a;
};
Entry.cutDecimal = function(b) {
  return Math.round(100 * b) / 100;
};
Entry.getBrowserType = function() {
  if (Entry.userAgent) {
    return Entry.userAgent;
  }
  var b = navigator.userAgent, a, d = b.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(d[1])) {
    return a = /\brv[ :]+(\d+)/g.exec(b) || [], "IE " + (a[1] || "");
  }
  if ("Chrome" === d[1] && (a = b.match(/\b(OPR|Edge)\/(\d+)/), null != a)) {
    return a.slice(1).join(" ").replace("OPR", "Opera");
  }
  d = d[2] ? [d[1], d[2]] : [navigator.appName, navigator.appVersion, "-?"];
  null != (a = b.match(/version\/(\d+)/i)) && d.splice(1, 1, a[1]);
  b = d.join(" ");
  return Entry.userAgent = b;
};
Entry.setBasicBrush = function(b) {
  var a = new createjs.Graphics;
  a.thickness = 1;
  a.rgb = Entry.hex2rgb("#ff0000");
  a.opacity = 100;
  a.setStrokeStyle(1);
  a.beginStroke("rgba(255,0,0,1)");
  var d = new createjs.Shape(a);
  Entry.stage.selectedObjectContainer.addChild(d);
  b.brush && (b.brush = null);
  b.brush = a;
  b.shape && (b.shape = null);
  b.shape = d;
};
Entry.setCloneBrush = function(b, a) {
  var d = new createjs.Graphics;
  d.thickness = a.thickness;
  d.rgb = a.rgb;
  d.opacity = a.opacity;
  d.setStrokeStyle(d.thickness);
  d.beginStroke("rgba(" + d.rgb.r + "," + d.rgb.g + "," + d.rgb.b + "," + d.opacity / 100 + ")");
  var c = new createjs.Shape(d);
  Entry.stage.selectedObjectContainer.addChild(c);
  b.brush && (b.brush = null);
  b.brush = d;
  b.shape && (b.shape = null);
  b.shape = c;
};
Entry.isFloat = function(b) {
  return /\d+\.{1}\d+$/.test(b);
};
Entry.getStringIndex = function(b) {
  if (!b) {
    return "";
  }
  for (var a = {string:b, index:1}, d = 0, c = [], e = b.length - 1;0 < e;--e) {
    var f = b.charAt(e);
    if (isNaN(f)) {
      break;
    } else {
      c.unshift(f), d = e;
    }
  }
  0 < d && (a.string = b.substring(0, d), a.index = parseInt(c.join("")) + 1);
  return a;
};
Entry.getOrderedName = function(b, a, d) {
  if (!b) {
    return "untitled";
  }
  if (!a || 0 === a.length) {
    return b;
  }
  d || (d = "name");
  for (var c = 0, e = Entry.getStringIndex(b), f = 0, g = a.length;f < g;f++) {
    var h = Entry.getStringIndex(a[f][d]);
    e.string === h.string && h.index > c && (c = h.index);
  }
  return 0 < c ? e.string + c : b;
};
Entry.changeXmlHashId = function(b) {
  if (/function_field/.test(b.getAttribute("type"))) {
    for (var a = b.getElementsByTagName("mutation"), d = 0, c = a.length;d < c;d++) {
      a[d].setAttribute("hashid", Entry.generateHash());
    }
  }
  return b;
};
Entry.getMaxFloatPoint = function(b) {
  for (var a = 0, d = 0, c = b.length;d < c;d++) {
    var e = String(b[d]), f = e.indexOf(".");
    -1 !== f && (e = e.length - (f + 1), e > a && (a = e));
  }
  return Math.min(a, 20);
};
Entry.convertToRoundedDecimals = function(b, a) {
  return isNaN(b) || !this.isFloat(b) ? b : Number(Math.round(b + "e" + a) + "e-" + a);
};
Entry.attachEventListener = function(b, a, d) {
  setTimeout(function() {
    b.addEventListener(a, d);
  }, 0);
};
Entry.deAttachEventListener = function(b, a, d) {
  b.removeEventListener(a, d);
};
Entry.isEmpty = function(b) {
  if (!b) {
    return !0;
  }
  for (var a in b) {
    if (b.hasOwnProperty(a)) {
      return !1;
    }
  }
  return !0;
};
Entry.Utils.disableContextmenu = function(b) {
  if (b) {
    $(b).on("contextmenu", function(a) {
      a.stopPropagation();
      a.preventDefault();
      return !1;
    });
  }
};
Entry.Utils.isRightButton = function(b) {
  return 2 == b.button || b.ctrlKey;
};
Entry.Utils.isTouchEvent = function(b) {
  return "mousedown" !== b.type.toLowerCase();
};
Entry.Utils.inherit = function(b, a) {
  function d() {
  }
  d.prototype = b.prototype;
  a.prototype = new d;
  return a;
};
Entry.bindAnimationCallbackOnce = function(b, a) {
  b.one("webkitAnimationEnd animationendo animationend", a);
};
Entry.Utils.isInInput = function(b) {
  return "textarea" == b.target.type || "text" == b.target.type;
};
Entry.Utils.isFunction = function(b) {
  return "function" === typeof b;
};
Entry.Utils.addFilters = function(b, a) {
  var d = b.elem("defs"), c = d.elem("filter", {id:"entryTrashcanFilter_" + a});
  c.elem("feGaussianBlur", {"in":"SourceAlpha", stdDeviation:2, result:"blur"});
  c.elem("feOffset", {"in":"blur", dx:1, dy:1, result:"offsetBlur"});
  c = c.elem("feMerge");
  c.elem("feMergeNode", {"in":"offsetBlur"});
  c.elem("feMergeNode", {"in":"SourceGraphic"}, c);
  c = d.elem("filter", {id:"entryBlockShadowFilter_" + a, height:"200%"});
  c.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:1});
  c.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"0.7 0 0 0 0 0 0.7 0 0 0 0 0 0.7 0 0 0 0 0 1 0"});
  c.elem("feBlend", {in:"SourceGraphic", in1:"offOut", mode:"normal"});
  d = d.elem("filter", {id:"entryBlockHighlightFilter_" + a});
  d.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:0});
  d.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"1.3 0 0 0 0 0 1.3 0 0 0 0 0 1.3 0 0 0 0 0 1 0"});
};
Entry.Utils.addBlockPattern = function(b, a) {
  for (var d = b.elem("pattern", {id:"blockHoverPattern_" + a, class:"blockHoverPattern", patternUnits:"userSpaceOnUse", patternTransform:"translate(12, 0)", x:0, y:0, width:125, height:33, style:"display: none"}), c = Entry.mediaFilePath + "block_pattern_(order).png", e = 1;5 > e;e++) {
    d.elem("image", {class:"pattern" + e, href:c.replace("(order)", e), x:0, y:0, width:125, height:33});
  }
  return {pattern:d};
};
Entry.Utils.COLLISION = {NONE:0, UP:1, RIGHT:2, LEFT:3, DOWN:4};
Entry.Utils.createMouseEvent = function(b, a) {
  var d = document.createEvent("MouseEvent");
  d.initMouseEvent(b, !0, !0, window, 0, 0, 0, a.clientX, a.clientY, !1, !1, !1, !1, 0, null);
  return d;
};
Entry.Utils.xmlToJsonData = function(b) {
  b = $.parseXML(b);
  var a = [];
  b = b.childNodes[0].childNodes;
  for (var d in b) {
    var c = b[d];
    if (c.tagName) {
      var e = {category:c.getAttribute("id"), blocks:[]}, c = c.childNodes;
      for (d in c) {
        var f = c[d];
        f.tagName && (f = f.getAttribute("type")) && e.blocks.push(f);
      }
      a.push(e);
    }
  }
  return a;
};
Entry.Utils.stopProjectWithToast = function(b, a, d) {
  var c = b.block;
  a = a || "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec \ubc1c\uc0dd";
  Entry.toast && !d && Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.check_runtime_error, !0);
  Entry.engine && Entry.engine.toggleStop();
  "workspace" === Entry.type && (b.block && "funcBlock" in b.block ? c = b.block.funcBlock : b.funcExecutor && (c = b.funcExecutor.scope.block, b = b.type.replace("func_", ""), Entry.Func.edit(Entry.variableContainer.functions_[b])), c && (Entry.container.selectObject(c.getCode().object.id, !0), c.view.getBoard().activateBlock(c)));
  throw Error(a);
};
Entry.Utils.AsyncError = function(b) {
  this.name = "AsyncError";
  this.message = b || "\ube44\ub3d9\uae30 \ud638\ucd9c \ub300\uae30";
};
Entry.Utils.AsyncError.prototype = Error();
Entry.Utils.AsyncError.prototype.constructor = Entry.Utils.AsyncError;
Entry.Utils.isChrome = function() {
  return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};
Entry.Utils.waitForWebfonts = function(b, a) {
  var d = 0;
  if (b && b.length) {
    for (var c = 0, e = b.length;c < e;++c) {
      (function(c) {
        function e() {
          h && h.offsetWidth != k && (++d, h.parentNode.removeChild(h), h = null);
          if (d >= b.length && (l && clearInterval(l), d == b.length)) {
            return a(), !0;
          }
        }
        var h = document.createElement("span");
        h.innerHTML = "giItT1WQy@!-/#";
        h.style.position = "absolute";
        h.style.left = "-10000px";
        h.style.top = "-10000px";
        h.style.fontSize = "300px";
        h.style.fontFamily = "sans-serif";
        h.style.fontVariant = "normal";
        h.style.fontStyle = "normal";
        h.style.fontWeight = "normal";
        h.style.letterSpacing = "0";
        document.body.appendChild(h);
        var k = h.offsetWidth;
        h.style.fontFamily = c;
        var l;
        e() || (l = setInterval(e, 50));
      })(b[c]);
    }
  } else {
    return a && a(), !0;
  }
};
window.requestAnimFrame = function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(b) {
    window.setTimeout(b, 1E3 / 60);
  };
}();
Entry.isMobile = function() {
  if (Entry.device) {
    return "tablet" === Entry.device;
  }
  var b = window.platform;
  if (b && b.type && ("tablet" === b.type || "mobile" === b.type)) {
    return Entry.device = "tablet", !0;
  }
  Entry.device = "desktop";
  return !1;
};
Entry.Utils.convertMouseEvent = function(b) {
  return b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
};
Entry.Utils.convertIntToHex = function(b) {
  return b.toString(16).toUpperCase();
};
Entry.Utils.hasSpecialCharacter = function(b) {
  return /!|@|#|\$|%|\^|&|\*|\(|\)|\+|=|-|\[|\]|\\|\'|;|,|\.|\/|{|}|\||\"|:|<|>|\?/g.test(b);
};
Entry.Utils.isNewVersion = function(b, a) {
  try {
    b = b.replace("v", "");
    a = a.replace("v", "");
    for (var d = b.split("."), c = a.split("."), e = d.length < c.length ? d.length : c.length, f = !1, g = !0, h = 0;h < e;h++) {
      Number(d[h]) < Number(c[h]) ? (f = !0, g = !1) : Number(d[h]) > Number(c[h]) && (g = !1);
    }
    g && d.length < c.length && (f = !0);
    return f;
  } catch (k) {
    return !1;
  }
};
Entry.Utils.getBlockCategory = function() {
  var b = {}, a;
  return function(d) {
    if (d) {
      if (b[d]) {
        return b[d];
      }
      a || (a = EntryStatic.getAllBlocks());
      for (var c = 0;c < a.length;c++) {
        var e = a[c], f = e.category;
        if (-1 < e.blocks.indexOf(d)) {
          return b[d] = f;
        }
      }
    }
  };
}();
Entry.Utils.getUniqObjectsBlocks = function(b) {
  b = b || Entry.container.objects_;
  var a = [];
  b.forEach(function(b) {
    b = b.script;
    b instanceof Entry.Code || (b = new Entry.Code(b));
    b.getBlockList().forEach(function(b) {
      0 > a.indexOf(b.type) && a.push(b.type);
    });
  });
  return a;
};
Entry.Utils.makeCategoryDataByBlocks = function(b) {
  if (b) {
    for (var a = this, d = EntryStatic.getAllBlocks(), c = {}, e = 0;e < d.length;e++) {
      var f = d[e];
      f.blocks = [];
      c[f.category] = e;
    }
    b.forEach(function(b) {
      var e = a.getBlockCategory(b), e = c[e];
      void 0 !== e && d[e].blocks.push(b);
    });
    b = EntryStatic.getAllBlocks();
    for (e = 0;e < b.length;e++) {
      var f = b[e], g = f.blocks;
      if ("func" === f.category) {
        b.splice(e, 1);
      } else {
        var h = d[e].blocks, k = [];
        g.forEach(function(a) {
          -1 < h.indexOf(a) && k.push(a);
        });
        d[e].blocks = k;
      }
    }
    return d;
  }
};
Entry.Model = function(b, a) {
  var d = Entry.Model;
  d.generateSchema(b);
  d.generateSetter(b);
  d.generateObserve(b);
  (void 0 === a || a) && Object.seal(b);
  return b;
};
(function(b) {
  b.generateSchema = function(a) {
    var b = a.schema;
    if (void 0 !== b) {
      b = JSON.parse(JSON.stringify(b));
      a.data = {};
      for (var c in b) {
        (function(c) {
          a.data[c] = b[c];
          Object.defineProperty(a, c, {get:function() {
            return a.data[c];
          }});
        })(c);
      }
      a._toJSON = this._toJSON;
    }
  };
  b.generateSetter = function(a) {
    a.set = this.set;
  };
  b.set = function(a, b) {
    var c = {}, e;
    for (e in this.data) {
      void 0 !== a[e] && (a[e] === this.data[e] ? delete a[e] : (c[e] = this.data[e], this.data[e] = a[e] instanceof Array ? a[e].concat() : a[e]));
    }
    b || this.notify(Object.keys(a), c);
  };
  b.generateObserve = function(a) {
    a.observers = [];
    a.observe = this.observe;
    a.unobserve = this.unobserve;
    a.notify = this.notify;
  };
  b.observe = function(a, b, c, e) {
    c = new Entry.Observer(this.observers, a, b, c);
    if (!1 !== e) {
      a[b]([]);
    }
    return c;
  };
  b.unobserve = function(a) {
    a.destroy();
  };
  b.notify = function(a, b) {
    "string" === typeof a && (a = [a]);
    var c = this;
    c.observers.map(function(e) {
      var f = a;
      void 0 !== e.attrs && (f = Entry.Utils.intersectArray(e.attrs, a));
      if (f.length) {
        e.object[e.funcName](f.map(function(a) {
          return {name:a, object:c, oldValue:b[a]};
        }));
      }
    });
  };
  b._toJSON = function() {
    var a = {}, b;
    for (b in this.data) {
      a[b] = this.data[b];
    }
    return a;
  };
})(Entry.Model);
Entry.TargetChecker = function(b, a) {
  this.isForEdit = a;
  this.goals = [];
  this.unachievedGoals = [];
  this.isForEdit && (this.watchingBlocks = [], Entry.playground.mainWorkspace.blockMenu.unbanClass("checker"));
  this.isSuccess = this.isFail = !1;
  this.entity = this;
  this.parent = this;
  Entry.achieve = this.achieveCheck.bind(this);
  Entry.achieveEvent = new Entry.Event;
  Entry.addEventListener("stop", this.reset.bind(this));
  Entry.registerAchievement = this.registerAchievement.bind(this);
  this.script = new Entry.Code(b ? b : [], this);
};
Entry.Utils.inherit(Entry.Extension, Entry.TargetChecker);
(function(b) {
  b.renderView = function() {
    this._view = Entry.Dom("li", {class:"targetChecker"});
    this._view.bindOnClick(function(a) {
      Entry.playground.injectObject(this);
    }.bind(this));
    this.updateView();
    return this._view;
  };
  b.updateView = function() {
    if (this._view) {
      var a = this.goals.length;
      this._view.text("\ubaa9\ud45c : " + (a - this.unachievedGoals.length) + " / " + a);
      this.isSuccess ? this._view.addClass("success") : this._view.removeClass("success");
      this.isFail ? this._view.addClass("fail") : this._view.removeClass("fail");
    }
  };
  b.achieveCheck = function(a, b) {
    this.isFail || (a ? this.achieveGoal(b) : this.fail(b));
  };
  b.achieveGoal = function(a) {
    this.isSuccess || this.isFail || 0 > this.unachievedGoals.indexOf(a) || (this.unachievedGoals.splice(this.unachievedGoals.indexOf(a), 1), 0 === this.unachievedGoals.length && (this.isSuccess = !0, Entry.achieveEvent.notify("success")), this.updateView());
  };
  b.fail = function() {
    this.isSuccess || this.isFail || (this.isFail = !0, Entry.achieveEvent.notify("fail"), this.updateView());
  };
  b.reset = function() {
    this.unachievedGoals = this.goals.concat();
    this.isSuccess = this.isFail = !1;
    this.updateView();
  };
  b.registerAchievement = function(a) {
    this.isForEdit && this.watchingBlocks.push(a);
    a.params[1] && this.goals.indexOf(0 > a.params[0]) && this.goals.push(a.params[0]);
    this.reset();
  };
  b.clearExecutor = function() {
    this.script.clearExecutors();
  };
})(Entry.TargetChecker.prototype);
Entry.Func = function(b) {
  this.id = b ? b.id : Entry.generateHash();
  this.content = b ? new Entry.Code(b.content) : new Entry.Code([[{type:"function_create", copyable:!1, deletable:!1, x:40, y:40}]]);
  this._backupContent = this.blockMenuBlock = this.block = null;
  this.hashMap = {};
  this.paramMap = {};
  Entry.generateFunctionSchema(this.id);
  if (b) {
    b = this.content._blockMap;
    for (var a in b) {
      Entry.Func.registerParamBlock(b[a].type);
    }
    Entry.Func.generateWsBlock(this);
  }
  Entry.Func.registerFunction(this);
  Entry.Func.updateMenu();
};
Entry.Func.threads = {};
Entry.Func.registerFunction = function(b) {
  if (Entry.playground) {
    var a = Entry.playground.mainWorkspace;
    a && (this._targetFuncBlock = a.getBlockMenu().getCategoryCodes("func").createThread([{type:"func_" + b.id}]), b.blockMenuBlock = this._targetFuncBlock);
  }
};
Entry.Func.executeFunction = function(b) {
  var a = this.threads[b];
  if (a = Entry.Engine.computeThread(a.entity, a)) {
    return this.threads[b] = a, !0;
  }
  delete this.threads[b];
  return !1;
};
Entry.Func.clearThreads = function() {
  this.threads = {};
};
Entry.Func.prototype.init = function(b) {
  this.id = b.id;
  this.content = Blockly.Xml.textToDom(b.content);
  this.block = Blockly.Xml.textToDom("<xml>" + b.block + "</xml>").childNodes[0];
};
Entry.Func.prototype.destroy = function() {
  this.blockMenuBlock.destroy();
};
Entry.Func.edit = function(b) {
  this.unbindFuncChangeEvent();
  this.unbindWorkspaceStateChangeEvent();
  this.cancelEdit();
  Entry.Func.isEdit = !0;
  this.targetFunc = b;
  this.initEditView(b.content);
  this.bindFuncChangeEvent();
  this.updateMenu();
  setTimeout(function() {
    this._backupContent = b.content.stringify();
  }.bind(this), 0);
};
Entry.Func.initEditView = function(b) {
  this.menuCode || this.setupMenuCode();
  var a = Entry.playground.mainWorkspace;
  a.setMode(Entry.Workspace.MODE_OVERLAYBOARD);
  a.changeOverlayBoardCode(b);
  b.recreateView();
  a.changeOverlayBoardCode(b);
  this._workspaceStateEvent = a.changeEvent.attach(this, this.endEdit);
  b.view.reDraw();
  b.view.board.alignThreads();
};
Entry.Func.endEdit = function(b) {
  this.unbindFuncChangeEvent();
  this.unbindWorkspaceStateChangeEvent();
  switch(b) {
    case "save":
      this.save();
      break;
    case "cancelEdit":
      this.cancelEdit();
  }
  this._backupContent = null;
  delete this.targetFunc;
  this.updateMenu();
  Entry.Func.isEdit = !1;
};
Entry.Func.save = function() {
  this.targetFunc.generateBlock(!0);
  Entry.variableContainer.saveFunction(this.targetFunc);
};
Entry.Func.syncFuncName = function(b) {
  var a = 0, d = [], d = b.split(" "), c = "";
  b = [];
  b = Blockly.mainWorkspace.getAllBlocks();
  for (var e = 0;e < b.length;e++) {
    var f = b[e];
    if ("function_general" === f.type) {
      for (var g = [], g = f.inputList, h = 0;h < g.length;h++) {
        f = g[h], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_ && (c += f.fieldRow[0].text_, c += " ");
      }
      c = c.trim();
      if (c === this.srcFName && this.srcFName.split(" ").length == d.length) {
        for (c = 0;c < g.length;c++) {
          if (f = g[c], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_) {
            if (void 0 === d[a]) {
              g.splice(c, 1);
              break;
            } else {
              f.fieldRow[0].text_ = d[a];
            }
            a++;
          }
        }
      }
      c = "";
      a = 0;
    }
  }
  a = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, a);
};
Entry.Func.cancelEdit = function() {
  this.targetFunc && (this.targetFunc.block ? this._backupContent && (this.targetFunc.content.load(this._backupContent), Entry.generateFunctionSchema(this.targetFunc.id), Entry.Func.generateWsBlock(this.targetFunc)) : (this._targetFuncBlock.destroy(), delete Entry.variableContainer.functions_[this.targetFunc.id], delete Entry.variableContainer.selected), Entry.variableContainer.updateList());
};
Entry.Func.getMenuXml = function() {
  var b = [];
  this.targetFunc || (b = b.concat(this.createBtn));
  if (this.targetFunc) {
    var a = this.FIELD_BLOCK, a = a.replace("#1", Entry.generateHash()), a = a.replace("#2", Entry.generateHash()), a = Blockly.Xml.textToDom(a).childNodes, b = b.concat(Entry.nodeListToArray(a))
  }
  for (var d in Entry.variableContainer.functions_) {
    a = Entry.variableContainer.functions_[d], a === this.targetFunc ? (a = Entry.Func.generateBlock(this.targetFunc, Blockly.Xml.workspaceToDom(Entry.Func.workspace), a.id).block, b.push(a)) : b.push(a.block);
  }
  return b;
};
Entry.Func.syncFunc = function() {
  var b = Entry.Func;
  if (b.targetFunc) {
    var a = b.workspace.topBlocks_[0].toString(), d = b.workspace.topBlocks_.length;
    (b.fieldText != a || b.workspaceLength != d) && 1 > Blockly.Block.dragMode_ && (b.updateMenu(), b.fieldText = a, b.workspaceLength = d);
  }
};
Entry.Func.setupMenuCode = function() {
  var b = Entry.playground.mainWorkspace;
  b && (b = b.getBlockMenu().getCategoryCodes("func"), this._fieldLabel = b.createThread([{type:"function_field_label"}]).getFirstBlock(), this._fieldString = b.createThread([{type:"function_field_string", params:[{type:this.requestParamBlock("string")}]}]).getFirstBlock(), this._fieldBoolean = b.createThread([{type:"function_field_boolean", params:[{type:this.requestParamBlock("boolean")}]}]).getFirstBlock(), this.menuCode = b);
};
Entry.Func.refreshMenuCode = function() {
  if (Entry.playground.mainWorkspace) {
    this.menuCode || this.setupMenuCode();
    var b = Entry.block[this._fieldString.params[0].type].changeEvent._listeners.length;
    2 < b && this._fieldString.params[0].changeType(this.requestParamBlock("string"));
    b = Entry.block[this._fieldBoolean.params[0].type].changeEvent._listeners.length;
    2 < b && this._fieldBoolean.params[0].changeType(this.requestParamBlock("boolean"));
  }
};
Entry.Func.requestParamBlock = function(b) {
  var a = Entry.generateHash(), d;
  switch(b) {
    case "string":
      d = Entry.block.function_param_string;
      break;
    case "boolean":
      d = Entry.block.function_param_boolean;
      break;
    default:
      return null;
  }
  a = b + "Param_" + a;
  b = Entry.Func.createParamBlock(a, d, b);
  Entry.block[a] = b;
  return a;
};
Entry.Func.registerParamBlock = function(b) {
  -1 < b.indexOf("stringParam") ? Entry.Func.createParamBlock(b, Entry.block.function_param_string, b) : -1 < b.indexOf("booleanParam") && Entry.Func.createParamBlock(b, Entry.block.function_param_boolean, b);
};
Entry.Func.createParamBlock = function(b, a, d) {
  var c = function() {
  };
  d = "string" === d ? "function_param_string" : "function_param_boolean";
  c.prototype = a;
  c = new c;
  c.changeEvent = new Entry.Event;
  c.template = Lang.template[d];
  return Entry.block[b] = c;
};
Entry.Func.updateMenu = function() {
  if (Entry.playground && Entry.playground.mainWorkspace) {
    var b = Entry.playground.mainWorkspace.getBlockMenu();
    this.targetFunc ? (this.menuCode || this.setupMenuCode(), b.banClass("functionInit", !0), b.unbanClass("functionEdit", !0)) : (b.unbanClass("functionInit", !0), b.banClass("functionEdit", !0));
    b.reDraw();
  }
};
Entry.Func.prototype.edit = function() {
  Entry.Func.isEdit || (Entry.Func.isEdit = !0, Entry.Func.svg ? this.parentView.appendChild(this.svg) : Entry.Func.initEditView());
};
Entry.Func.generateBlock = function(b) {
  b = Entry.block["func_" + b.id];
  var a = {template:b.template, params:b.params}, d = /(%\d)/mi, c = b.template.split(d), e = "", f = 0, g = 0, h;
  for (h in c) {
    var k = c[h];
    d.test(k) ? (k = Number(k.split("%")[1]) - 1, k = b.params[k], "Indicator" !== k.type && ("boolean" === k.accept ? (e += Lang.template.function_param_boolean + (f ? f : ""), f++) : (e += Lang.template.function_param_string + (g ? g : ""), g++))) : e += k;
  }
  return {block:a, description:e};
};
Entry.Func.prototype.generateBlock = function(b) {
  b = Entry.Func.generateBlock(this);
  this.block = b.block;
  this.description = b.description;
};
Entry.Func.generateWsBlock = function(b) {
  this.unbindFuncChangeEvent();
  b = b ? b : this.targetFunc;
  for (var a = b.content.getEventMap("funcDef")[0].params[0], d = 0, c = 0, e = [], f = "", g = b.hashMap, h = b.paramMap;a;) {
    var k = a.params[0];
    switch(a.type) {
      case "function_field_label":
        f = f + " " + k;
        break;
      case "function_field_boolean":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_logical_variable + " " + (d ? d : "")});
        g[k.type] = !1;
        h[k.type] = d + c;
        d++;
        e.push({type:"Block", accept:"boolean"});
        f += " %" + (d + c);
        break;
      case "function_field_string":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_character_variable + " " + (c ? c : "")}), g[k.type] = !1, h[k.type] = d + c, c++, f += " %" + (d + c), e.push({type:"Block", accept:"string"});
    }
    a = a.getOutputBlock();
  }
  d++;
  f += " %" + (d + c);
  e.push({type:"Indicator", img:"block_icon/function_03.png", size:12});
  a = "func_" + b.id;
  d = Entry.block[a];
  c = !1;
  if (d.template !== f) {
    c = !0;
  } else {
    if (d.params.length === e.length) {
      for (h = 0;h < d.params.length - 1;h++) {
        var k = d.params[h], l = e[h];
        if (k.type !== l.type || k.accept !== l.accept) {
          c = !0;
          break;
        }
      }
    }
  }
  c && Entry.Mutator.mutate(a, {params:e, template:f});
  for (var m in g) {
    g[m] ? (e = -1 < m.indexOf("string") ? Lang.Blocks.FUNCTION_character_variable : Lang.Blocks.FUNCTION_logical_variable, Entry.Mutator.mutate(m, {template:e})) : g[m] = !0;
  }
  this.bindFuncChangeEvent(b);
};
Entry.Func.bindFuncChangeEvent = function(b) {
  b = b ? b : this.targetFunc;
  !this._funcChangeEvent && b.content.getEventMap("funcDef")[0].view && (this._funcChangeEvent = b.content.getEventMap("funcDef")[0].view._contents[1].changeEvent.attach(this, this.generateWsBlock));
};
Entry.Func.unbindFuncChangeEvent = function() {
  this._funcChangeEvent && (this._funcChangeEvent.destroy(), delete this._funcChangeEvent);
};
Entry.Func.unbindWorkspaceStateChangeEvent = function() {
  this._workspaceStateEvent && (this._workspaceStateEvent.destroy(), delete this._workspaceStateEvent);
};
Entry.HWMontior = {};
Entry.HWMonitor = function(b) {
  this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  this._hwModule = b;
  var a = this;
  Entry.addEventListener("windowResized", function() {
    var b = a._hwModule.monitorTemplate.mode;
    "both" == b && (a.resize(), a.resizeList());
    "list" == b ? a.resizeList() : a.resize();
  });
  Entry.addEventListener("hwModeChange", function() {
    a.changeMode();
  });
  this.changeOffset = 0;
  this.scale = .5;
  this._listPortViews = {};
};
(function(b) {
  b.initView = function() {
    this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  };
  b.generateView = function() {
    this.snap = Entry.SVG("hwMonitor");
    this._svgGroup = this.snap.elem("g");
    this._portMap = {n:[], e:[], s:[], w:[]};
    var a = this._hwModule.monitorTemplate, b = {href:Entry.mediaFilePath + a.imgPath, x:-a.width / 2, y:-a.height / 2, width:a.width, height:a.height};
    this._portViews = {};
    this.hwView = this._svgGroup.elem("image");
    this.hwView = this.hwView.attr(b);
    this._template = a;
    a = a.ports;
    this.pathGroup = null;
    this.pathGroup = this._svgGroup.elem("g");
    var b = [], c;
    for (c in a) {
      var e = this.generatePortView(a[c], "_svgGroup");
      this._portViews[c] = e;
      b.push(e);
    }
    b.sort(function(a, b) {
      return a.box.x - b.box.x;
    });
    var f = this._portMap;
    b.map(function(a) {
      (1 > (Math.atan2(-a.box.y, a.box.x) / Math.PI + 2) % 2 ? f.n : f.s).push(a);
    });
    this.resize();
  };
  b.toggleMode = function(a) {
    var b = this._hwModule.monitorTemplate;
    "list" == a ? (b.TempPort = null, this._hwModule.monitorTemplate.ports && (this._hwModule.monitorTemplate.TempPort = this._hwModule.monitorTemplate.ports, this._hwModule.monitorTemplate.listPorts = this.addPortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._svgGroup && $(this._svgGroup).remove(), $(this._pathGroup).remove(), this._hwModule.monitorTemplate.mode = "list", this.generateListView()) : (this._hwModule.monitorTemplate.TempPort && 
    (this._hwModule.monitorTemplate.ports = this._hwModule.monitorTemplate.TempPort, this._hwModule.monitorTemplate.listPorts = this.removePortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._hwModule.monitorTemplate.mode = "both", this.generateListView(), this.generateView());
  };
  b.setHwmonitor = function(a) {
    this._hwmodule = a;
  };
  b.changeMode = function(a) {
    "both" == this._hwModule.monitorTemplate.mode ? this.toggleMode("list") : "list" == this._hwModule.monitorTemplate.mode && this.toggleMode("both");
  };
  b.addPortEle = function(a, b) {
    if ("object" != typeof b) {
      return a;
    }
    for (var c in b) {
      a[c] = b[c];
    }
    return a;
  };
  b.removePortEle = function(a, b) {
    if ("object" != typeof b) {
      return a;
    }
    for (var c in b) {
      delete a[c];
    }
    return a;
  };
  b.generateListView = function() {
    this._portMapList = {n:[]};
    this._svglistGroup = null;
    this.listsnap = Entry.SVG("hwMonitor");
    this._svglistGroup = this.listsnap.elem("g");
    var a = this._hwModule.monitorTemplate;
    this._template = a;
    a = a.listPorts;
    this.pathGroup = this._svglistGroup.elem("g");
    var b = [], c;
    for (c in a) {
      var e = this.generatePortView(a[c], "_svglistGroup");
      this._listPortViews[c] = e;
      b.push(e);
    }
    var f = this._portMapList;
    b.map(function(a) {
      f.n.push(a);
    });
    this.resizeList();
  };
  b.generatePortView = function(a, b) {
    var c = this[b].elem("g");
    c.addClass("hwComponent");
    var e = null, e = this.pathGroup.elem("path").attr({d:"m0,0", fill:"none", stroke:"input" === a.type ? "#00979d" : "#A751E3", "stroke-width":3}), f = c.elem("rect").attr({x:0, y:0, width:150, height:22, rx:4, ry:4, fill:"#fff", stroke:"#a0a1a1"}), g = c.elem("text").attr({x:4, y:12, fill:"#000", "class":"hwComponentName", "alignment-baseline":"central"});
    g.textContent = a.name;
    g = g.getComputedTextLength();
    c.elem("rect").attr({x:g + 8, y:2, width:30, height:18, rx:9, ry:9, fill:"input" === a.type ? "#00979d" : "#A751E3"});
    var h = c.elem("text").attr({x:g + 13, y:12, fill:"#fff", "class":"hwComponentValue", "alignment-baseline":"central"});
    h.textContent = 0;
    g += 40;
    f.attr({width:g});
    return {group:c, value:h, type:a.type, path:e, box:{x:a.pos.x - this._template.width / 2, y:a.pos.y - this._template.height / 2, width:g}, width:g};
  };
  b.getView = function() {
    return this.svgDom;
  };
  b.update = function() {
    var a = Entry.hw.portData, b = Entry.hw.sendQueue, c = this._hwModule.monitorTemplate.mode, e = this._hwModule.monitorTemplate.keys || [], f = [];
    if ("list" == c) {
      f = this._listPortViews;
    } else {
      if ("both" == c) {
        if (f = this._listPortViews, this._portViews) {
          for (var g in this._portViews) {
            f[g] = this._portViews[g];
          }
        }
      } else {
        f = this._portViews;
      }
    }
    if (b) {
      for (g in b) {
        0 != b[g] && f[g] && (f[g].type = "output");
      }
    }
    for (var h in f) {
      if (c = f[h], "input" == c.type) {
        var k = a[h];
        0 < e.length && $.each(e, function(a, b) {
          if ($.isPlainObject(k)) {
            k = k[b] || 0;
          } else {
            return !1;
          }
        });
        c.value.textContent = k ? k : 0;
        c.group.getElementsByTagName("rect")[1].attr({fill:"#00979D"});
      } else {
        k = b[h], 0 < e.length && $.each(e, function(a, b) {
          if ($.isPlainObject(k)) {
            k = k[b] || 0;
          } else {
            return !1;
          }
        }), c.value.textContent = k ? k : 0, c.group.getElementsByTagName("rect")[1].attr({fill:"#A751E3"});
      }
    }
  };
  b.resize = function() {
    this.hwView && this.hwView.attr({transform:"scale(" + this.scale + ")"});
    if (this.svgDom) {
      var a = this.svgDom.get(0).getBoundingClientRect()
    }
    this._svgGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 1.8 + ")"});
    this._rect = a;
    0 >= this._template.height || 0 >= a.height || (this.scale = a.height / this._template.height * this._template.height / 1E3, this.align());
  };
  b.resizeList = function() {
    var a = this.svgDom.get(0).getBoundingClientRect();
    this._svglistGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 2 + ")"});
    this._rect = a;
    this.alignList();
  };
  b.align = function() {
    var a = [], a = this._portMap.s.concat();
    this._alignNS(a, this.scale / 3 * this._template.height + 5, 27);
    a = this._portMap.n.concat();
    this._alignNS(a, -this._template.height * this.scale / 3 - 32, -27);
    a = this._portMap.e.concat();
    this._alignEW(a, -this._template.width * this.scale / 3 - 5, -27);
    a = this._portMap.w.concat();
    this._alignEW(a, this._template.width * this.scale / 3 - 32, -27);
  };
  b.alignList = function() {
    for (var a = {}, a = this._hwModule.monitorTemplate.listPorts, b = a.length, c = 0;c < a.length;c++) {
      a[c].group.attr({transform:"translate(" + this._template.width * (c / b - .5) + "," + (-this._template.width / 2 - 30) + ")"});
    }
    a = this._portMapList.n.concat();
    this._alignNSList(a, -this._template.width * this.scale / 2 - 32, -27);
  };
  b._alignEW = function(a, b, c) {
    var e = a.length, f = this._rect.height - 50;
    tP = -f / 2;
    bP = f / 2;
    height = this._rect.height;
    listVLine = wholeHeight = 0;
    mode = this._hwModule.monitorTemplate;
    for (f = 0;f < e;f++) {
      wholeHeight += a[f].height + 5;
    }
    wholeHeight < bP - tP && (bP = wholeHeight / 2 + 3, tP = -wholeHeight / 2 - 3);
    for (;1 < e;) {
      var g = a.shift(), f = a.pop(), h = tP, k = bP, l = c;
      wholeWidth <= bP - tP ? (tP += g.width + 5, bP -= f.width + 5, l = 0) : 0 === a.length ? (tP = (tP + bP) / 2 - 3, bP = tP + 6) : (tP = Math.max(tP, -width / 2 + g.width) + 15, bP = Math.min(bP, width / 2 - f.width) - 15);
      wholeWidth -= g.width + f.width + 10;
      b += l;
    }
    a.length && a[0].group.attr({transform:"translate(" + b + ",60)"});
    g && rPort && (this._movePort(g, b, tP, h), this._movePort(rPort, b, bP, k));
  };
  b._alignNS = function(a, b, c) {
    for (var e = -this._rect.width / 2, f = this._rect.width / 2, g = this._rect.width, h = 0, k = 0;k < a.length;k++) {
      h += a[k].width + 5;
    }
    h < f - e && (f = h / 2 + 3, e = -h / 2 - 3);
    for (;1 < a.length;) {
      var k = a.shift(), l = a.pop(), m = e, n = f, q = c;
      h <= f - e ? (e += k.width + 5, f -= l.width + 5, q = 0) : 0 === a.length ? (e = (e + f) / 2 - 3, f = e + 6) : (e = Math.max(e, -g / 2 + k.width) + 15, f = Math.min(f, g / 2 - l.width) - 15);
      this._movePort(k, e, b, m);
      this._movePort(l, f, b, n);
      h -= k.width + l.width + 10;
      b += q;
    }
    a.length && this._movePort(a[0], (f + e - a[0].width) / 2, b, 100);
  };
  b._alignNSList = function(a, b) {
    var c = this._rect.width;
    initX = -this._rect.width / 2 + 10;
    initY = -this._rect.height / 2 + 10;
    for (var e = listLine = wholeWidth = 0;e < a.length;e++) {
      wholeWidth += a[e].width;
    }
    for (var f = 0, g = 0, h = initX, k = 0, l = 0, m = 0, e = 0;e < a.length;e++) {
      l = a[e], e != a.length - 1 && (m = a[e + 1]), g += l.width, lP = initX, k = initY + 30 * f, l.group.attr({transform:"translate(" + lP + "," + k + ")"}), initX += l.width + 10, g > c - (l.width + m.width / 2.2) && (f += 1, initX = h, g = 0);
    }
  };
  b._movePort = function(a, b, c, e) {
    var f = b, g = a.box.x * this.scale, h = a.box.y * this.scale;
    b > e ? (f = b - a.width, b = b > g && g > e ? "M" + g + "," + c + "L" + g + "," + h : "M" + (b + e) / 2 + "," + c + "l0," + (h > c ? 28 : -3) + "H" + g + "L" + g + "," + h) : b = b < g && g < e ? "m" + g + "," + c + "L" + g + "," + h : "m" + (e + b) / 2 + "," + c + "l0," + (h > c ? 28 : -3) + "H" + g + "L" + g + "," + h;
    a.group.attr({transform:"translate(" + f + "," + c + ")"});
    a.path.attr({d:b});
  };
})(Entry.HWMonitor.prototype);
Entry.HW = function() {
  this.sessionRoomId = localStorage.getItem("entryhwRoomId");
  this.sessionRoomId || (this.sessionRoomId = this.createRandomRoomId(), localStorage.setItem("entryhwRoomId", this.sessionRoomId));
  this.connectTrial = 0;
  this.isFirstConnect = !0;
  this.requireVerion = "v1.6.1";
  this.downloadPath = "http://download.play-entry.org/apps/Entry_HW_1.6.2_Setup.exe";
  this.hwPopupCreate();
  this.initSocket();
  this.connected = !1;
  this.portData = {};
  this.sendQueue = {};
  this.outputQueue = {};
  this.settingQueue = {};
  this.socketType = this.hwModule = this.selectedDevice = null;
  Entry.addEventListener("stop", this.setZero);
  this.hwInfo = {"1.1":Entry.Arduino, "1.9":Entry.ArduinoExt, "1.2":Entry.SensorBoard, "1.3":Entry.CODEino, "1.4":Entry.joystick, "1.5":Entry.dplay, "1.6":Entry.nemoino, "1.7":Entry.Xbot, "1.8":Entry.ardublock, "1.A":Entry.Cobl, "2.4":Entry.Hamster, "2.5":Entry.Albert, "3.1":Entry.Bitbrick, "4.2":Entry.Arduino, "5.1":Entry.Neobot, "7.1":Entry.Robotis_carCont, "7.2":Entry.Robotis_openCM70, "8.1":Entry.Arduino, "10.1":Entry.Roborobo_Roduino, "10.2":Entry.Roborobo_SchoolKit, "12.1":Entry.EV3, "B.1":Entry.Codestar, 
  "A.1":Entry.SmartBoard};
};
Entry.HW.TRIAL_LIMIT = 2;
p = Entry.HW.prototype;
p.createRandomRoomId = function() {
  return "xxxxxxxxyx".replace(/[xy]/g, function(b) {
    var a = 16 * Math.random() | 0;
    return ("x" == b ? a : a & 3 | 8).toString(16);
  });
};
p.connectWebSocket = function(b, a) {
  var d = this, c = io(b, a);
  c.io.reconnectionAttempts(Entry.HW.TRIAL_LIMIT);
  c.io.reconnectionDelayMax(1E3);
  c.io.timeout(1E3);
  c.on("connect", function() {
    d.socketType = "WebSocket";
    d.initHardware(c);
  });
  c.on("mode", function(a) {
    0 === c.mode && 1 === a && d.disconnectHardware();
    d.socketMode = a;
    c.mode = a;
  });
  c.on("message", function(a) {
    if (a.data && "string" === typeof a.data) {
      switch(a.data) {
        case "disconnectHardware":
          d.disconnectHardware();
          break;
        default:
          var b = JSON.parse(a.data);
          d.checkDevice(b, a.version);
          d.updatePortData(b);
      }
    }
  });
  c.on("disconnect", function() {
    d.initSocket();
  });
  return c;
};
p.initSocket = function() {
  try {
    this.connected = !1;
    this.tlsSocketIo && this.tlsSocketIo.removeAllListeners();
    this.socketIo && this.socketIo.removeAllListeners();
    this.isOpenHardware || this.checkOldClient();
    if (-1 < location.protocol.indexOf("https")) {
      this.tlsSocketIo = this.connectWebSocket("https://hardware.play-entry.org:23518", {query:{client:!0, roomId:this.sessionRoomId}});
    } else {
      try {
        this.socketIo = this.connectWebSocket("http://127.0.0.1:23518", {query:{client:!0, roomId:this.sessionRoomId}});
      } catch (b) {
      }
      try {
        this.tlsSocketIo = this.connectWebSocket("https://hardware.play-entry.org:23518", {query:{client:!0, roomId:this.sessionRoomId}});
      } catch (b) {
      }
    }
    Entry.dispatchEvent("hwChanged");
  } catch (b) {
  }
};
p.checkOldClient = function() {
  try {
    var b = this, a = new WebSocket("wss://hardware.play-entry.org:23518");
    a.onopen = function() {
      b.popupHelper.show("newVersion", !0);
      a.close();
    };
  } catch (d) {
  }
};
p.retryConnect = function() {
  this.isOpenHardware = !1;
  Entry.HW.TRIAL_LIMIT = 5;
  this.initSocket();
};
p.openHardwareProgram = function() {
  this.isOpenHardware = !0;
  Entry.HW.TRIAL_LIMIT = 5;
  this.socket ? this.executeHardware() : (this.executeHardware(), this.initSocket());
};
p.initHardware = function(b) {
  this.socket = b;
  this.connectTrial = 0;
  this.connected = !0;
  Entry.dispatchEvent("hwChanged");
  Entry.playground && Entry.playground.object && Entry.playground.setMenu(Entry.playground.object.objectType);
};
p.disconnectHardware = function() {
  Entry.propertyPanel.removeMode("hw");
  this.hwModule = this.selectedDevice = void 0;
  Entry.dispatchEvent("hwChanged");
};
p.disconnectedSocket = function() {
  this.tlsSocketIo.close();
  this.socketIo && this.socketIo.close();
  Entry.propertyPanel.removeMode("hw");
  this.socket = void 0;
  this.connectTrial = 0;
  this.connected = !1;
  this.hwModule = this.selectedDevice = void 0;
  Entry.dispatchEvent("hwChanged");
  Entry.toast.alert("\ud558\ub4dc\uc6e8\uc5b4 \ud504\ub85c\uadf8\ub7a8 \uc5f0\uacb0 \uc885\ub8cc", "\ud558\ub4dc\uc6e8\uc5b4 \ud504\ub85c\uadf8\ub7a8\uacfc\uc758 \uc5f0\uacb0\uc774 \uc885\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.", !1);
};
p.setDigitalPortValue = function(b, a) {
  this.sendQueue[b] = a;
  this.removePortReadable(b);
};
p.getAnalogPortValue = function(b) {
  return this.connected ? this.portData["a" + b] : 0;
};
p.getDigitalPortValue = function(b) {
  if (!this.connected) {
    return 0;
  }
  this.setPortReadable(b);
  return void 0 !== this.portData[b] ? this.portData[b] : 0;
};
p.setPortReadable = function(b) {
  this.sendQueue.readablePorts || (this.sendQueue.readablePorts = []);
  var a = !1, d;
  for (d in this.sendQueue.readablePorts) {
    if (this.sendQueue.readablePorts[d] == b) {
      a = !0;
      break;
    }
  }
  a || this.sendQueue.readablePorts.push(b);
};
p.removePortReadable = function(b) {
  if (this.sendQueue.readablePorts || Array.isArray(this.sendQueue.readablePorts)) {
    var a, d;
    for (d in this.sendQueue.readablePorts) {
      if (this.sendQueue.readablePorts[d] == b) {
        a = Number(d);
        break;
      }
    }
    this.sendQueue.readablePorts = void 0 != a ? this.sendQueue.readablePorts.slice(0, a).concat(this.sendQueue.readablePorts.slice(a + 1, this.sendQueue.readablePorts.length)) : [];
  }
};
p.update = function() {
  this.socket && (this.socket.disconnected || this.socket.emit("message", {data:JSON.stringify(this.sendQueue), mode:this.socket.mode, type:"utf8"}));
};
p.updatePortData = function(b) {
  this.portData = b;
  this.hwMonitor && "hw" == Entry.propertyPanel.selected && this.hwMonitor.update();
};
p.closeConnection = function() {
  this.socket && this.socket.close();
};
p.downloadConnector = function() {
  window.open(this.downloadPath, "_blank").focus();
};
p.downloadGuide = function() {
  var b = document.createElement("a");
  b.href = "http://download.play-entry.org/data/%EC%97%94%ED%8A%B8%EB%A6%AC%20%ED%95%98%EB%93%9C%EC%9B%A8%EC%96%B4%20%EC%97%B0%EA%B2%B0%20%EB%A7%A4%EB%89%B4%EC%96%BC(%EC%98%A8%EB%9D%BC%EC%9D%B8%EC%9A%A9).pdf";
  b.download = "download";
  b.click();
};
p.downloadSource = function() {
  window.open("http://play-entry.com/down/board.ino", "_blank").focus();
};
p.setZero = function() {
  Entry.hw.hwModule && Entry.hw.hwModule.setZero();
};
p.checkDevice = function(b, a) {
  if (void 0 !== b.company) {
    var d = [Entry.Utils.convertIntToHex(b.company), ".", Entry.Utils.convertIntToHex(b.model)].join("");
    d != this.selectedDevice && (Entry.Utils.isNewVersion(a, this.requireVerion) && this.popupHelper.show("newVersion", !0), this.selectedDevice = d, this.hwModule = this.hwInfo[d], Entry.dispatchEvent("hwChanged"), Entry.toast.success("\ud558\ub4dc\uc6e8\uc5b4 \uc5f0\uacb0 \uc131\uacf5", "\ud558\ub4dc\uc6e8\uc5b4 \uc544\uc774\ucf58\uc744 \ub354\ube14\ud074\ub9ad\ud558\uba74, \uc13c\uc11c\uac12\ub9cc \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.", !1), this.hwModule.monitorTemplate && (this.hwMonitor ? 
    (this.hwMonitor._hwModule = this.hwModule, this.hwMonitor.initView()) : this.hwMonitor = new Entry.HWMonitor(this.hwModule), Entry.propertyPanel.addMode("hw", this.hwMonitor), d = this.hwModule.monitorTemplate, "both" == d.mode ? (d.mode = "list", this.hwMonitor.generateListView(), d.mode = "general", this.hwMonitor.generateView(), d.mode = "both") : "list" == d.mode ? this.hwMonitor.generateListView() : this.hwMonitor.generateView()));
  }
};
p.banHW = function() {
  var b = this.hwInfo, a;
  for (a in b) {
    Entry.playground.mainWorkspace.blockMenu.banClass(b[a].name, !0);
  }
};
p.executeHardware = function() {
  function b(a) {
    navigator.msLaunchUri(a, function() {
    }, function() {
      c.popupHelper.show("hwDownload", !0);
    });
  }
  function a(a) {
    var b = document.createElement("iframe");
    b.src = "about:blank";
    b.style = "display:none";
    document.getElementsByTagName("body")[0].appendChild(b);
    var d = null, d = setTimeout(function() {
      var e = !1;
      try {
        b.contentWindow.location.href = a, e = !0;
      } catch (f) {
        "NS_ERROR_UNKNOWN_PROTOCOL" == f.name && (e = !1);
      }
      e || c.popupHelper.show("hwDownload", !0);
      document.getElementsByTagName("body")[0].removeChild(b);
      clearTimeout(d);
    }, 500);
  }
  function d(a) {
    var b = !1;
    window.focus();
    window.onblur = function() {
      b = !0;
    };
    location.assign(encodeURI(a));
    setTimeout(function() {
      (0 == b || 0 < navigator.userAgent.indexOf("Edge")) && c.popupHelper.show("hwDownload", !0);
      window.onblur = null;
    }, 1500);
  }
  var c = this, e = {_bNotInstalled:!1, init:function(a, b) {
    this._w = window.open("/views/hwLoading.html", "entry_hw_launcher", "width=220, height=225,  top=" + window.screenTop + ", left=" + window.screenLeft);
    var c = null, c = setTimeout(function() {
      e.runViewer(a, b);
      clearInterval(c);
    }, 1E3);
  }, runViewer:function(a, b) {
    this._w.document.write("<iframe src='" + a + "' onload='opener.Entry.hw.ieLauncher.set()' style='display:none;width:0;height:0'></iframe>");
    var c = 0, d = null, d = setInterval(function() {
      try {
        this._w.location.href;
      } catch (a) {
        this._bNotInstalled = !0;
      }
      if (10 < c) {
        clearInterval(d);
        var e = 0, f = null, f = setInterval(function() {
          e++;
          this._w.closed || 2 < e ? clearInterval(f) : this._w.close();
          this._bNotInstalled = !1;
          c = 0;
        }.bind(this), 5E3);
        b(!this._bNotInstalled);
      }
      c++;
    }.bind(this), 100);
  }, set:function() {
    this._bNotInstalled = !0;
  }};
  c.ieLauncher = e;
  var f = "entryhw://-roomId:" + this.sessionRoomId;
  0 < navigator.userAgent.indexOf("MSIE") || 0 < navigator.userAgent.indexOf("Trident") ? void 0 != navigator.msLaunchUri ? b(f) : 9 > (0 < document.documentMode ? document.documentMode : navigator.userAgent.match(/(?:MSIE) ([0-9.]+)/)[1]) ? alert(Lang.msgs.not_support_browser) : e.init(f, function(a) {
    0 == a && c.popupHelper.show("hwDownload", !0);
  }) : 0 < navigator.userAgent.indexOf("Firefox") ? a(f) : 0 < navigator.userAgent.indexOf("Chrome") || 0 < navigator.userAgent.indexOf("Safari") ? d(f) : alert(Lang.msgs.not_support_browser);
};
p.hwPopupCreate = function() {
  var b = this;
  this.popupHelper || (this.popupHelper = window.popupHelper ? window.popupHelper : new Entry.popupHelper(!0));
  this.popupHelper.addPopup("newVersion", {type:"confirm", title:Lang.Msgs.new_version_title, setPopupLayout:function(a) {
    var d = Entry.Dom("div", {class:"contentArea"}), c = Entry.Dom("div", {class:"textArea", parent:d}), e = Entry.Dom("div", {class:"text1", parent:c}), f = Entry.Dom("div", {class:"text2", parent:c}), g = Entry.Dom("div", {class:"text3", parent:c}), c = Entry.Dom("div", {class:"text4", parent:c}), h = Entry.Dom("div", {classes:["popupCancelBtn", "popupDefaultBtn"], parent:d}), k = Entry.Dom("div", {classes:["popupOkBtn", "popupDefaultBtn"], parent:d});
    e.text(Lang.Msgs.new_version_text1);
    f.html(Lang.Msgs.new_version_text2);
    g.text(Lang.Msgs.new_version_text3);
    c.text(Lang.Msgs.new_version_text4);
    h.text(Lang.Buttons.cancel);
    k.html(Lang.Msgs.new_version_download);
    d.bindOnClick(".popupDefaultBtn", function(a) {
      $(this).hasClass("popupOkBtn") ? b.downloadConnector() : b.popupHelper.hide("newVersion");
    });
    a.append(d);
  }});
  this.popupHelper.addPopup("hwDownload", {type:"confirm", title:Lang.Msgs.not_install_title, setPopupLayout:function(a) {
    var d = Entry.Dom("div", {class:"contentArea"}), c = Entry.Dom("div", {class:"textArea", parent:d}), e = Entry.Dom("div", {class:"text1", parent:c}), f = Entry.Dom("div", {class:"text2", parent:c}), g = Entry.Dom("div", {class:"text3", parent:c}), c = Entry.Dom("div", {class:"text4", parent:c}), h = Entry.Dom("div", {classes:["popupCancelBtn", "popupDefaultBtn"], parent:d}), k = Entry.Dom("div", {classes:["popupOkBtn", "popupDefaultBtn"], parent:d});
    e.text(Lang.Msgs.hw_download_text1);
    f.html(Lang.Msgs.hw_download_text2);
    g.text(Lang.Msgs.hw_download_text3);
    c.text(Lang.Msgs.hw_download_text4);
    h.text(Lang.Buttons.cancel);
    k.html(Lang.Msgs.hw_download_btn);
    d.bindOnClick(".popupDefaultBtn", function(a) {
      $(this).hasClass("popupOkBtn") ? b.downloadConnector() : b.popupHelper.hide("hwDownload");
    });
    a.append(d);
  }});
};
Entry.BlockModel = function() {
  Entry.Model(this);
};
Entry.BlockModel.prototype.schema = {id:null, x:0, y:0, type:null, params:{}, statements:{}, prev:null, next:null, view:null};
Entry.BlockRenderModel = function() {
  Entry.Model(this);
};
Entry.BlockRenderModel.prototype.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, width:0, height:0, magneting:!1};
Entry.BoxModel = function() {
  Entry.Model(this);
};
Entry.BoxModel.prototype.schema = {id:0, type:Entry.STATIC.BOX_MODEL, x:0, y:0, width:0, height:0};
Entry.DragInstance = function(b) {
  Entry.Model(this);
  this.set(b);
};
Entry.DragInstance.prototype.schema = {type:Entry.STATIC.DRAG_INSTANCE, startX:0, startY:0, offsetX:0, offsetY:0, absX:0, absY:0, prev:null, height:0, mode:0, isNew:!1};
Entry.ThreadModel = function() {
  Entry.Model(this);
};
Entry.ThreadModel.prototype.schema = {id:0, type:Entry.STATIC.THREAD_MODEL, x:0, y:0, width:0, minWidth:0, height:0};
Entry.Stage = function() {
  this.variables = {};
  this.background = new createjs.Shape;
  this.background.graphics.beginFill("#ffffff").drawRect(-480, -240, 960, 480);
  this.objectContainers = [];
  this.selectedObjectContainer = null;
  this.variableContainer = new createjs.Container;
  this.dialogContainer = new createjs.Container;
  this.selectedObject = null;
  this.isObjectClick = !1;
};
Entry.Stage.prototype.initStage = function(b) {
  this.canvas = new createjs.Stage(b.id);
  this.canvas.x = 320;
  this.canvas.y = 180;
  this.canvas.scaleX = this.canvas.scaleY = 2 / 1.5;
  createjs.Touch.enable(this.canvas);
  this.canvas.enableMouseOver(10);
  this.canvas.mouseMoveOutside = !0;
  this.canvas.addChild(this.background);
  this.canvas.addChild(this.variableContainer);
  this.canvas.addChild(this.dialogContainer);
  this.inputField = null;
  this.initCoordinator();
  this.initHandle();
  this.mouseCoordinate = {x:0, y:0};
  if (Entry.isPhone()) {
    b.ontouchstart = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    }, b.ontouchend = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
  } else {
    var a = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    };
    b.onmousedown = a;
    b.ontouchstart = a;
    a = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
    b.onmouseup = a;
    b.ontouchend = a;
    $(document).click(function(a) {
      Entry.stage.focused = "entryCanvas" === a.target.id ? !0 : !1;
    });
  }
  Entry.addEventListener("canvasClick", function(a) {
    Entry.stage.isObjectClick = !1;
  });
  Entry.windowResized.attach(this, function() {
    Entry.stage.updateBoundRect();
  });
  $(window).scroll(function() {
    Entry.stage.updateBoundRect();
  });
  a = function(a) {
    a.preventDefault();
    var b = Entry.stage.getBoundRect(), e;
    -1 < Entry.getBrowserType().indexOf("IE") ? (e = 480 * ((a.pageX - b.left - document.documentElement.scrollLeft) / b.width - .5), a = -270 * ((a.pageY - b.top - document.documentElement.scrollTop) / b.height - .5)) : a.changedTouches ? (e = 480 * ((a.changedTouches[0].pageX - b.left - document.body.scrollLeft) / b.width - .5), a = -270 * ((a.changedTouches[0].pageY - b.top - document.body.scrollTop) / b.height - .5)) : (e = 480 * ((a.pageX - b.left - document.body.scrollLeft) / b.width - .5), 
    a = -270 * ((a.pageY - b.top - document.body.scrollTop) / b.height - .5));
    Entry.stage.mouseCoordinate = {x:e.toFixed(1), y:a.toFixed(1)};
    Entry.dispatchEvent("stageMouseMove");
  };
  b.onmousemove = a;
  b.ontouchmove = a;
  b.onmouseout = function(a) {
    Entry.dispatchEvent("stageMouseOut");
  };
  Entry.addEventListener("updateObject", function(a) {
    Entry.engine.isState("stop") && Entry.stage.updateObject();
  });
  Entry.addEventListener("canvasInputComplete", function(a) {
    try {
      var b = Entry.stage.inputField.value();
      Entry.stage.hideInputField();
      if (b) {
        var e = Entry.container;
        e.setInputValue(b);
        e.inputValue.complete = !0;
      }
    } catch (f) {
    }
  });
  this.initWall();
  this.render();
};
Entry.Stage.prototype.render = function() {
  Entry.stage.timer && clearTimeout(Entry.stage.timer);
  var b = (new Date).getTime();
  Entry.stage.update();
  b = (new Date).getTime() - b;
  Entry.stage.timer = setTimeout(Entry.stage.render, 16 - b % 16 + 16 * Math.floor(b / 16));
};
Entry.Stage.prototype.update = function() {
  "invisible" !== Entry.type && (Entry.requestUpdate ? (Entry.engine.isState("stop") && this.objectUpdated ? (this.canvas.update(), this.objectUpdated = !1) : this.canvas.update(), this.inputField && !this.inputField._isHidden && this.inputField.render(), Entry.requestUpdateTwice ? Entry.requestUpdateTwice = !1 : Entry.requestUpdate = !1) : Entry.requestUpdate = !1);
};
Entry.Stage.prototype.loadObject = function(b) {
  var a = b.entity.object;
  this.getObjectContainerByScene(b.scene).addChild(a);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.loadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).addChild(b.object);
  this.sortZorder();
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.unloadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).removeChild(b.object);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.loadVariable = function(b) {
  var a = b.view_;
  this.variables[b.id] = a;
  this.variableContainer.addChild(a);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.removeVariable = function(b) {
  this.variableContainer.removeChild(b.view_);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.loadDialog = function(b) {
  this.dialogContainer.addChild(b.object);
};
Entry.Stage.prototype.unloadDialog = function(b) {
  this.dialogContainer.removeChild(b.object);
};
Entry.Stage.prototype.sortZorder = function() {
  for (var b = Entry.container.getCurrentObjects(), a = this.selectedObjectContainer, d = 0, c = b.length - 1;0 <= c;c--) {
    for (var e = b[c], f = e.entity, e = e.clonedEntities, g = 0, h = e.length;g < h;g++) {
      e[g].shape && a.setChildIndex(e[g].shape, d++), a.setChildIndex(e[g].object, d++);
    }
    f.shape && a.setChildIndex(f.shape, d++);
    a.setChildIndex(f.object, d++);
  }
};
Entry.Stage.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "workspace_coordinate.png");
  a.scaleX = .5;
  a.scaleY = .5;
  a.x = -240;
  a.y = -135;
  b.addChild(a);
  this.canvas.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Stage.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.selectObject = function(b) {
  this.selectedObject = b ? b : null;
  this.updateObject();
};
Entry.Stage.prototype.initHandle = function() {
  this.handle = new EaselHandle(this.canvas);
  this.handle.setChangeListener(this, this.updateHandle);
  this.handle.setEditStartListener(this, this.startEdit);
  this.handle.setEditEndListener(this, this.endEdit);
};
Entry.Stage.prototype.updateObject = function() {
  if ("invisible" !== Entry.type && (Entry.requestUpdate = !0, this.handle.setDraggable(!0), !this.editEntity)) {
    var b = this.selectedObject;
    if (b) {
      "textBox" == b.objectType ? this.handle.toggleCenter(!1) : this.handle.toggleCenter(!0);
      "free" == b.getRotateMethod() ? this.handle.toggleRotation(!0) : this.handle.toggleRotation(!1);
      this.handle.toggleDirection(!0);
      b.getLock() ? (this.handle.toggleRotation(!1), this.handle.toggleDirection(!1), this.handle.toggleResize(!1), this.handle.toggleCenter(!1), this.handle.setDraggable(!1)) : this.handle.toggleResize(!0);
      this.handle.setVisible(!0);
      var a = b.entity;
      this.handle.setWidth(a.getScaleX() * a.getWidth());
      this.handle.setHeight(a.getScaleY() * a.getHeight());
      var d, c;
      if ("textBox" == a.type) {
        if (a.getLineBreak()) {
          d = a.regX * a.scaleX, c = -a.regY * a.scaleY;
        } else {
          var e = a.getTextAlign();
          c = -a.regY * a.scaleY;
          switch(e) {
            case Entry.TEXT_ALIGN_LEFT:
              d = -a.getWidth() / 2 * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_CENTER:
              d = a.regX * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_RIGHT:
              d = a.getWidth() / 2 * a.scaleX;
          }
        }
      } else {
        d = (a.regX - a.width / 2) * a.scaleX, c = (a.height / 2 - a.regY) * a.scaleY;
      }
      e = a.getRotation() / 180 * Math.PI;
      this.handle.setX(a.getX() - d * Math.cos(e) - c * Math.sin(e));
      this.handle.setY(-a.getY() - d * Math.sin(e) + c * Math.cos(e));
      this.handle.setRegX((a.regX - a.width / 2) * a.scaleX);
      this.handle.setRegY((a.regY - a.height / 2) * a.scaleY);
      this.handle.setRotation(a.getRotation());
      this.handle.setDirection(a.getDirection());
      this.objectUpdated = !0;
      this.handle.setVisible(b.entity.getVisible());
      b.entity.getVisible() && this.handle.render();
    } else {
      this.handle.setVisible(!1);
    }
  }
};
Entry.Stage.prototype.updateHandle = function() {
  this.editEntity = !0;
  var b = this.handle, a = this.selectedObject.entity;
  if (a.lineBreak) {
    a.setHeight(b.height / a.getScaleY()), a.setWidth(b.width / a.getScaleX());
  } else {
    if (0 !== a.width) {
      var d = Math.abs(b.width / a.width);
      a.flip && (d *= -1);
      a.setScaleX(d);
    }
    0 !== a.height && a.setScaleY(b.height / a.height);
  }
  d = b.rotation / 180 * Math.PI;
  if ("textBox" == a.type) {
    var c = b.regX / a.scaleX, c = b.regY / a.scaleY;
    if (a.getLineBreak()) {
      a.setX(b.x), a.setY(-b.y);
    } else {
      switch(a.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          a.setX(b.x - b.width / 2 * Math.cos(d));
          a.setY(-b.y + b.width / 2 * Math.sin(d));
          break;
        case Entry.TEXT_ALIGN_CENTER:
          a.setX(b.x);
          a.setY(-b.y);
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          a.setX(b.x + b.width / 2 * Math.cos(d)), a.setY(-b.y - b.width / 2 * Math.sin(d));
      }
    }
  } else {
    c = a.width / 2 + b.regX / a.scaleX, a.setX(b.x + b.regX * Math.cos(d) - b.regY * Math.sin(d)), a.setRegX(c), c = a.height / 2 + b.regY / a.scaleY, a.setY(-b.y - b.regX * Math.sin(d) - b.regY * Math.cos(d)), a.setRegY(c);
  }
  a.setDirection(b.direction);
  a.setRotation(b.rotation);
  this.selectedObject.entity.doCommand();
  this.editEntity = !1;
};
Entry.Stage.prototype.startEdit = function() {
  this.selectedObject.entity.initCommand();
};
Entry.Stage.prototype.endEdit = function() {
  this.selectedObject.entity.checkCommand();
};
Entry.Stage.prototype.initWall = function() {
  var b = new createjs.Container, a = new Image;
  a.src = Entry.mediaFilePath + "media/bound.png";
  b.up = new createjs.Bitmap;
  b.up.scaleX = 16;
  b.up.y = -165;
  b.up.x = -240;
  b.up.image = a;
  b.addChild(b.up);
  b.down = new createjs.Bitmap;
  b.down.scaleX = 16;
  b.down.y = 135;
  b.down.x = -240;
  b.down.image = a;
  b.addChild(b.down);
  b.right = new createjs.Bitmap;
  b.right.scaleY = 9;
  b.right.y = -135;
  b.right.x = 240;
  b.right.image = a;
  b.addChild(b.right);
  b.left = new createjs.Bitmap;
  b.left.scaleY = 9;
  b.left.y = -135;
  b.left.x = -270;
  b.left.image = a;
  b.addChild(b.left);
  this.canvas.addChild(b);
  this.wall = b;
};
Entry.Stage.prototype.showInputField = function(b) {
  b = 1 / 1.5;
  this.inputField || (this.inputField = new CanvasInput({canvas:document.getElementById("entryCanvas"), fontSize:30 * b, fontFamily:"NanumGothic", fontColor:"#212121", width:556 * b, height:26 * b, padding:8 * b, borderWidth:1 * b, borderColor:"#000", borderRadius:3 * b, boxShadow:"none", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:202 * b, y:450 * b, topPosition:!0, onsubmit:function() {
    Entry.dispatchEvent("canvasInputComplete");
  }}));
  b = new createjs.Container;
  var a = new Image;
  a.src = Entry.mediaFilePath + "confirm_button.png";
  var d = new createjs.Bitmap;
  d.scaleX = .23;
  d.scaleY = .23;
  d.x = 160;
  d.y = 89;
  d.cursor = "pointer";
  d.image = a;
  b.addChild(d);
  b.on("mousedown", function(a) {
    Entry.dispatchEvent("canvasInputComplete");
  });
  this.inputSubmitButton || (this.inputField.value(""), this.canvas.addChild(b), this.inputSubmitButton = b);
  this.inputField.show();
  Entry.requestUpdateTwice = !0;
};
Entry.Stage.prototype.hideInputField = function() {
  this.inputField && this.inputField.value() && this.inputField.value("");
  this.inputSubmitButton && (this.canvas.removeChild(this.inputSubmitButton), this.inputSubmitButton = null);
  this.inputField && this.inputField.hide();
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.initObjectContainers = function() {
  var b = Entry.scene.scenes_;
  if (b && 0 !== b.length) {
    for (var a = 0;a < b.length;a++) {
      this.objectContainers[a] = this.createObjectContainer(b[a]);
    }
    this.selectedObjectContainer = this.objectContainers[0];
  } else {
    b = this.createObjectContainer(Entry.scene.selectedScene), this.objectContainers.push(b), this.selectedObjectContainer = b;
  }
  "invisible" !== Entry.type && this.canvas.addChild(this.selectedObjectContainer);
  this.selectObjectContainer(Entry.scene.selectedScene);
};
Entry.Stage.prototype.selectObjectContainer = function(b) {
  if (this.canvas) {
    for (var a = this.objectContainers, d = 0;d < a.length;d++) {
      this.canvas.removeChild(a[d]);
    }
    this.selectedObjectContainer = this.getObjectContainerByScene(b);
    this.canvas.addChildAt(this.selectedObjectContainer, 2);
  }
};
Entry.Stage.prototype.reAttachToCanvas = function() {
  for (var b = [this.selectedObjectContainer, this.variableContainer, this.coordinator, this.handle, this.dialogContainer], a = 0;a < b.length;a++) {
    this.canvas.removeChild(b[a]), this.canvas.addChild(b[a]);
  }
  console.log(this.canvas.getChildIndex(this.selectedObjectContainer));
};
Entry.Stage.prototype.createObjectContainer = function(b) {
  var a = new createjs.Container;
  a.scene = b;
  return a;
};
Entry.Stage.prototype.removeObjectContainer = function(b) {
  var a = this.objectContainers;
  b = this.getObjectContainerByScene(b);
  this.canvas && this.canvas.removeChild(b);
  a.splice(this.objectContainers.indexOf(b), 1);
};
Entry.Stage.prototype.getObjectContainerByScene = function(b) {
  for (var a = this.objectContainers, d = 0;d < a.length;d++) {
    if (a[d].scene.id == b.id) {
      return a[d];
    }
  }
};
Entry.Stage.prototype.moveSprite = function(b) {
  if (this.selectedObject && Entry.stage.focused && !this.selectedObject.getLock()) {
    var a = 5;
    b.shiftKey && (a = 1);
    var d = this.selectedObject.entity;
    switch(b.keyCode) {
      case 38:
        d.setY(d.getY() + a);
        break;
      case 40:
        d.setY(d.getY() - a);
        break;
      case 37:
        d.setX(d.getX() - a);
        break;
      case 39:
        d.setX(d.getX() + a);
    }
    this.updateObject();
  }
};
Entry.Stage.prototype.getBoundRect = function(b) {
  return this._boundRect ? this._boundRect : this.updateBoundRect();
};
Entry.Stage.prototype.updateBoundRect = function(b) {
  return this._boundRect = this.canvas.canvas.getBoundingClientRect();
};
Entry.Variable = function(b) {
  Entry.assert("string" == typeof b.name, "Variable name must be given");
  this.name_ = b.name;
  this.id_ = b.id ? b.id : Entry.generateHash();
  this.type = b.variableType ? b.variableType : "variable";
  this.object_ = b.object || null;
  this.isCloud_ = b.isCloud || !1;
  this._valueWidth = this._nameWidth = null;
  var a = Entry.parseNumber(b.value);
  this.value_ = "number" == typeof a ? a : b.value ? b.value : 0;
  "slide" == this.type ? (this.setMinValue(b.minValue), this.setMaxValue(b.maxValue)) : "list" == this.type && (this.array_ = b.array ? b.array : []);
  b.isClone || (this.visible_ = b.visible || "boolean" == typeof b.visible ? b.visible : !0, this.x_ = b.x ? b.x : null, this.y_ = b.y ? b.y : null, "list" == this.type && (this.width_ = b.width ? b.width : 100, this.height_ = b.height ? b.height : 120, this.scrollPosition = 0), this.BORDER = 6, this.FONT = "10pt NanumGothic");
};
Entry.Variable.prototype.generateView = function(b) {
  var a = this.type;
  if ("variable" == a || "timer" == a || "answer" == a) {
    this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.wrapper_ = new createjs.Shape, this.view_.addChild(this.wrapper_), this.textView_ = new createjs.Text("asdf", this.FONT, "#000000"), this.textView_.textBaseline = "alphabetic", this.textView_.x = 4, this.textView_.y = 1, this.view_.addChild(this.textView_), this.valueView_ = new createjs.Text("asdf", "10pt NanumGothic", "#ffffff"), this.valueView_.textBaseline = 
    "alphabetic", a = Entry.variableContainer.variables_.length, this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11))), this.view_.visible = this.visible_, this.view_.addChild(this.valueView_), this.view_.on("mousedown", function(a) {
      "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
    }), this.view_.on("pressmove", function(a) {
      "workspace" == Entry.type && (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
    });
  } else {
    if ("slide" == a) {
      var d = this;
      this.view_ = new createjs.Container;
      this.rect_ = new createjs.Shape;
      this.view_.addChild(this.rect_);
      this.view_.variable = this;
      this.wrapper_ = new createjs.Shape;
      this.view_.addChild(this.wrapper_);
      this.textView_ = new createjs.Text("name", this.FONT, "#000000");
      this.textView_.textBaseline = "alphabetic";
      this.textView_.x = 4;
      this.textView_.y = 1;
      this.view_.addChild(this.textView_);
      this.valueView_ = new createjs.Text("value", "10pt NanumGothic", "#ffffff");
      this.valueView_.textBaseline = "alphabetic";
      this.view_.on("mousedown", function(a) {
        "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)});
      });
      this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || d.isAdjusting || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      });
      this.view_.visible = this.visible_;
      this.view_.addChild(this.valueView_);
      a = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26;
      a = Math.max(a, 90);
      this.maxWidth = a - 20;
      this.slideBar_ = new createjs.Shape;
      this.slideBar_.graphics.beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5);
      this.view_.addChild(this.slideBar_);
      a = this.getSlidePosition(this.maxWidth);
      this.valueSetter_ = new createjs.Shape;
      this.valueSetter_.graphics.beginFill("#1bafea").s("#A0A1A1").ss(1).dc(a, 10.5, 3);
      this.valueSetter_.cursor = "pointer";
      this.valueSetter_.on("mousedown", function(a) {
        Entry.engine.isState("run") && (d.isAdjusting = !0, this.offsetX = -(this.x - .75 * a.stageX + 240));
      });
      this.valueSetter_.on("pressmove", function(a) {
        if (Entry.engine.isState("run")) {
          var b = this.offsetX;
          this.offsetX = -(this.x - .75 * a.stageX + 240);
          b !== this.offsetX && (a = d.getX(), d.setSlideCommandX(a + 10 > this.offsetX ? 0 : a + d.maxWidth + 10 > this.offsetX ? this.offsetX - a : d.maxWidth + 10));
        }
      });
      this.valueSetter_.on("pressup", function(a) {
        d.isAdjusting = !1;
      });
      this.view_.addChild(this.valueSetter_);
      a = Entry.variableContainer.variables_.length;
      this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11)));
    } else {
      this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.titleView_ = new createjs.Text("asdf", this.FONT, "#000"), this.titleView_.textBaseline = "alphabetic", this.titleView_.textAlign = "center", this.titleView_.width = this.width_ - 2 * this.BORDER, this.titleView_.y = this.BORDER + 10, this.titleView_.x = this.width_ / 2, this.view_.addChild(this.titleView_), this.resizeHandle_ = new createjs.Shape, this.resizeHandle_.graphics.f("#1bafea").ss(1, 
      0, 0).s("#1bafea").lt(0, -9).lt(-9, 0).lt(0, 0), this.view_.addChild(this.resizeHandle_), this.resizeHandle_.list = this, this.resizeHandle_.on("mouseover", function(a) {
        this.cursor = "nwse-resize";
      }), this.resizeHandle_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.offset = {x:.75 * a.stageX - this.list.getWidth(), y:.75 * a.stageY - this.list.getHeight()};
        this.parent.cursor = "nwse-resize";
      }), this.resizeHandle_.on("pressmove", function(a) {
        this.list.setWidth(.75 * a.stageX - this.offset.x);
        this.list.setHeight(.75 * a.stageY - this.offset.y);
        this.list.updateView();
      }), this.view_.on("mouseover", function(a) {
        this.cursor = "move";
      }), this.view_.on("mousedown", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
      }), this.view_.on("pressup", function(a) {
        this.cursor = "initial";
        this.variable.isResizing = !1;
      }), this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      }), this.elementView = new createjs.Container, a = new createjs.Text("asdf", this.FONT, "#000"), a.textBaseline = "middle", a.y = 5, this.elementView.addChild(a), this.elementView.indexView = a, a = new createjs.Shape, this.elementView.addChild(a), this.elementView.valueWrapper = a, a = new createjs.Text("fdsa", this.FONT, "#eee"), a.x = 24, a.y = 6, a.textBaseline = "middle", this.elementView.addChild(a), this.elementView.valueView = a, this.elementView.x = this.BORDER, this.scrollButton_ = 
      new createjs.Shape, this.scrollButton_.graphics.f("#aaa").rr(0, 0, 7, 30, 3.5), this.view_.addChild(this.scrollButton_), this.scrollButton_.y = 23, this.scrollButton_.list = this, this.scrollButton_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.cursor = "pointer";
        this.offsetY = isNaN(this.offsetY) || 0 > this.offsetY ? a.rawY / 2 : this.offsetY;
      }), this.scrollButton_.on("pressmove", function(a) {
        void 0 === this.moveAmount ? (this.y = a.target.y, this.moveAmount = !0) : this.y = a.rawY / 2 - this.offsetY + this.list.height_ / 100 * 23;
        23 > this.y && (this.y = 23);
        this.y > this.list.getHeight() - 40 && (this.y = this.list.getHeight() - 40);
        this.list.updateView();
      }), this.scrollButton_.on("pressup", function(a) {
        this.moveAmount = void 0;
      }), this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (a = Entry.variableContainer.lists_.length, this.setX(110 * -Math.floor(a / 6) + 120), this.setY(24 * b + 20 - 135 - 145 * Math.floor(a / 6)));
    }
  }
  this.setVisible(this.isVisible());
  this.updateView();
  Entry.stage.loadVariable(this);
};
Entry.Variable.prototype.updateView = function() {
  if (this.view_) {
    if (this.isVisible()) {
      if ("variable" == this.type) {
        this.view_.x = this.getX();
        this.view_.y = this.getY();
        var b = this.textView_.text, a;
        a = this.object_ ? (a = Entry.container.getObject(this.object_)) ? a.name + ":" + this.getName() : this.getName() : this.getName();
        b !== a && (this.textView_.text = a, this._nameWidth = null);
        null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth());
        this.valueView_.x = this._nameWidth + 14;
        this.valueView_.y = 1;
        this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue();
        null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth());
        this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4);
        this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7);
      } else {
        if ("slide" == this.type) {
          this.view_.x = this.getX(), this.view_.y = this.getY(), b = this.textView_.text, a = this.object_ ? (a = Entry.container.getObject(this.object_)) ? a.name + ":" + this.getName() : this.getName() : this.getName(), b !== a && (this.textView_.text = a, this._nameWidth = null), null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", 
          "") : this.valueView_.text = this.getValue(), null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth()), b = this._nameWidth + this._valueWidth + 26, b = Math.max(b, 90), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, b, 33, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7), b = this._nameWidth + this._valueWidth + 26, b = Math.max(b, 
          90), this.maxWidth = b - 20, this.slideBar_.graphics.clear().beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5), b = this.getSlidePosition(this.maxWidth), this.valueSetter_.graphics.clear().beginFill("#1bafea").s("#A0A1A1").ss(1).dc(b, 10.5, 3);
        } else {
          if ("list" == this.type) {
            this.view_.x = this.getX();
            this.view_.y = this.getY();
            this.resizeHandle_.x = this.width_ - 2;
            this.resizeHandle_.y = this.height_ - 2;
            b = this.getName();
            this.object_ && (a = Entry.container.getObject(this.object_)) && (b = a.name + ":" + b);
            b = 7 < b.length ? b.substr(0, 6) + ".." : b;
            this.titleView_.text = b;
            this.titleView_.x = this.width_ / 2;
            for (this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rect(0, 0, this.width_, this.height_);this.view_.children[4];) {
              this.view_.removeChild(this.view_.children[4]);
            }
            b = Math.floor((this.getHeight() - 20) / 20);
            b < this.array_.length ? (this.scrollButton_.y > this.getHeight() - 40 && (this.scrollButton_.y = this.getHeight() - 40), this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, -2, this.getWidth() - 20 - 10 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !0, this.scrollButton_.x = this.getWidth() - 12, this.scrollPosition = Math.floor((this.scrollButton_.y - 23) / (this.getHeight() - 23 - 40) * (this.array_.length - b))) : (this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, 
            -2, this.getWidth() - 20 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !1, this.scrollPosition = 0);
            for (a = this.scrollPosition;a < this.scrollPosition + b && a < this.array_.length;a++) {
              this.elementView.indexView.text = a + 1;
              var d = String(this.array_[a].data), c = Math.floor((this.getWidth() - 50) / 7), d = Entry.cutStringByLength(d, c), d = String(this.array_[a].data).length > d.length ? d + ".." : d;
              this.elementView.valueView.text = d;
              d = this.elementView.clone(!0);
              d.y = 20 * (a - this.scrollPosition) + 23;
              this.view_.addChild(d);
            }
          } else {
            "answer" == this.type ? (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.y = 1, this.isNumber() ? parseInt(this.getValue(), 10) == this.getValue() ? this.valueView_.text = this.getValue() : this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth()), null === this._valueWidth && (this._valueWidth = 
            this.valueView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#E457DC").ss(1, 2, 0).s("#E457DC").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7)) : (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), null === this._nameWidth && (this._nameWidth = 
            this.textView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth()), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#ffbb14").ss(1, 
            2, 0).s("orange").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7));
          }
        }
      }
    }
    Entry.requestUpdate = !0;
  }
};
Entry.Variable.prototype.getName = function() {
  return this.name_;
};
Entry.Variable.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "Variable name must be string");
  this.name_ = b;
  this._nameWidth = null;
  this.updateView();
  Entry.requestUpdateTwice = !0;
};
Entry.Variable.prototype.getId = function() {
  return this.id_;
};
Entry.Variable.prototype.getValue = function() {
  return this.isNumber() ? Number(this.value_) : this.value_;
};
Entry.Variable.prototype.isNumber = function() {
  return isNaN(this.value_) ? !1 : !0;
};
Entry.Variable.prototype.setValue = function(b) {
  "slide" != this.type ? this.value_ = b : (b = Number(b), this.value_ = b < this.minValue_ ? this.minValue_ : b > this.maxValue_ ? this.maxValue_ : b);
  this.isCloud_ && Entry.variableContainer.updateCloudVariables();
  this._valueWidth = null;
  this.updateView();
  Entry.requestUpdateTwice = !0;
};
Entry.Variable.prototype.isVisible = function() {
  return this.visible_;
};
Entry.Variable.prototype.setVisible = function(b) {
  Entry.assert("boolean" == typeof b, "Variable visible state must be boolean");
  this.visible !== b && (this.visible_ = this.view_.visible = b, this.updateView());
};
Entry.Variable.prototype.setX = function(b) {
  this.x_ = b;
  this.updateView();
};
Entry.Variable.prototype.getX = function() {
  return this.x_;
};
Entry.Variable.prototype.setY = function(b) {
  this.y_ = b;
  this.updateView();
};
Entry.Variable.prototype.getY = function() {
  return this.y_;
};
Entry.Variable.prototype.setWidth = function(b) {
  this.width_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getWidth = function() {
  return this.width_;
};
Entry.Variable.prototype.isInList = function(b, a) {
  this.getX();
  this.getY();
};
Entry.Variable.prototype.setHeight = function(b) {
  this.height_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getHeight = function() {
  return this.height_;
};
Entry.Variable.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
};
Entry.Variable.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  delete this.snapshot_;
};
Entry.Variable.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.setVisible(b.visible);
  this.isCloud_ || this.setValue(b.value);
  this.setName(b.name);
  this.isCloud_ = b.isCloud;
  "list" == this.type && (this.isCloud_ || (this.array_ = b.array), this.setWidth(b.width), this.setHeight(b.height));
};
Entry.Variable.prototype.toJSON = function() {
  var b = {};
  b.name = this.name_;
  b.id = this.id_;
  b.visible = this.visible_;
  b.value = this.value_;
  b.variableType = this.type;
  "list" == this.type ? (b.width = this.getWidth(), b.height = this.getHeight(), b.array = JSON.parse(JSON.stringify(this.array_))) : "slide" == this.type && (b.minValue = this.minValue_, b.maxValue = this.maxValue_);
  b.isCloud = this.isCloud_;
  b.object = this.object_;
  b.x = this.x_;
  b.y = this.y_;
  return b;
};
Entry.Variable.prototype.remove = function() {
  Entry.stage.removeVariable(this);
};
Entry.Variable.prototype.clone = function() {
  var b = this.toJSON();
  b.isClone = !0;
  return b = new Entry.Variable(b);
};
Entry.Variable.prototype.getType = function() {
  return this.type;
};
Entry.Variable.prototype.setType = function(b) {
  this.type = b;
};
Entry.Variable.prototype.getSlidePosition = function(b) {
  var a = this.minValue_;
  return Math.abs(this.value_ - a) / Math.abs(this.maxValue_ - a) * b + 10;
};
Entry.Variable.prototype.setSlideCommandX = function(b) {
  var a = this.valueSetter_.graphics.command;
  b = Math.max("undefined" == typeof b ? 10 : b, 10);
  b = Math.min(this.maxWidth + 10, b);
  a.x = b;
  this.updateSlideValueByView();
};
Entry.Variable.prototype.updateSlideValueByView = function() {
  var b = Math.max(this.valueSetter_.graphics.command.x - 10, 0) / this.maxWidth;
  0 > b && (b = 0);
  1 < b && (b = 1);
  var a = parseFloat(this.minValue_), d = parseFloat(this.maxValue_), b = (a + Number(Math.abs(d - a) * b)).toFixed(2), b = parseFloat(b);
  b < a ? b = this.minValue_ : b > d && (b = this.maxValue_);
  this.isFloatPoint() || (b = Math.round(b));
  this.setValue(b);
};
Entry.Variable.prototype.getMinValue = function() {
  return this.minValue_;
};
Entry.Variable.prototype.setMinValue = function(b) {
  this.minValue_ = b = b || 0;
  this.value_ < b && this.setValue(b);
  this.updateView();
  this.isMinFloat = Entry.isFloat(this.minValue_);
};
Entry.Variable.prototype.getMaxValue = function() {
  return this.maxValue_;
};
Entry.Variable.prototype.setMaxValue = function(b) {
  this.maxValue_ = b = b || 100;
  this.value_ > b && (this.value_ = b);
  this.updateView();
  this.isMaxFloat = Entry.isFloat(this.maxValue_);
};
Entry.Variable.prototype.isFloatPoint = function() {
  return this.isMaxFloat || this.isMinFloat;
};
Entry.VariableContainer = function() {
  this.variables_ = [];
  this.messages_ = [];
  this.lists_ = [];
  this.functions_ = {};
  this.viewMode_ = "all";
  this.selected = null;
  this.variableAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.listAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.selectedVariable = null;
  this._variableRefs = [];
  this._messageRefs = [];
  this._functionRefs = [];
};
Entry.VariableContainer.prototype.createDom = function(b) {
  var a = this;
  this.view_ = b;
  var d = Entry.createElement("table");
  d.addClass("entryVariableSelectorWorkspace");
  this.view_.appendChild(d);
  var c = Entry.createElement("tr");
  d.appendChild(c);
  var e = this.createSelectButton("all");
  e.setAttribute("rowspan", "2");
  e.addClass("selected", "allButton");
  c.appendChild(e);
  c.appendChild(this.createSelectButton("variable", Entry.variableEnable));
  c.appendChild(this.createSelectButton("message", Entry.messageEnable));
  c = Entry.createElement("tr");
  c.appendChild(this.createSelectButton("list", Entry.listEnable));
  c.appendChild(this.createSelectButton("func", Entry.functionEnable));
  d.appendChild(c);
  d = Entry.createElement("ul");
  d.addClass("entryVariableListWorkspace");
  this.view_.appendChild(d);
  this.listView_ = d;
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.variable_add;
  var f = this;
  this.variableAddButton_ = d;
  d.bindOnClick(function(b) {
    b = f.variableAddPanel;
    var c = b.view.name.value.trim();
    b.isOpen ? c && 0 !== c.length ? a.addVariable() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  this.generateVariableAddView();
  this.generateListAddView();
  this.generateVariableSplitterView();
  this.generateVariableSettingView();
  this.generateListSettingView();
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.message_create;
  this.messageAddButton_ = d;
  d.bindOnClick(function(b) {
    a.addMessage({name:Lang.Workspace.message + " " + (a.messages_.length + 1)});
  });
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.list_create;
  this.listAddButton_ = d;
  d.bindOnClick(function(b) {
    b = f.listAddPanel;
    var c = b.view.name.value.trim();
    b.isOpen ? c && 0 !== c.length ? a.addList() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.function_add;
  this.functionAddButton_ = d;
  d.bindOnClick(function(b) {
    b = Entry.playground;
    var c = a._getBlockMenu();
    b.changeViewMode("code");
    "func" != c.lastSelector && c.selectMenu("func");
    a.createFunction();
  });
  return b;
};
Entry.VariableContainer.prototype.createSelectButton = function(b, a) {
  var d = this;
  void 0 === a && (a = !0);
  var c = Entry.createElement("td");
  c.addClass("entryVariableSelectButtonWorkspace", b);
  c.innerHTML = Lang.Workspace[b];
  a ? c.bindOnClick(function(a) {
    d.selectFilter(b);
    this.addClass("selected");
  }) : c.addClass("disable");
  return c;
};
Entry.VariableContainer.prototype.selectFilter = function(b) {
  for (var a = this.view_.getElementsByTagName("td"), d = 0;d < a.length;d++) {
    a[d].removeClass("selected"), a[d].hasClass(b) && a[d].addClass("selected");
  }
  this.viewMode_ = b;
  this.select();
  this.updateList();
};
Entry.VariableContainer.prototype.updateVariableAddView = function(b) {
  b = "variable" == (b ? b : "variable") ? this.variableAddPanel : this.listAddPanel;
  var a = b.info, d = b.view;
  b.view.addClass("entryRemove");
  d.cloudCheck.removeClass("entryVariableAddChecked");
  d.localCheck.removeClass("entryVariableAddChecked");
  d.globalCheck.removeClass("entryVariableAddChecked");
  d.cloudWrapper.removeClass("entryVariableAddSpaceUnCheckedWorkspace");
  a.isCloud && d.cloudCheck.addClass("entryVariableAddChecked");
  b.isOpen && (d.removeClass("entryRemove"), d.name.focus());
  a.object ? (d.localCheck.addClass("entryVariableAddChecked"), d.cloudWrapper.addClass("entryVariableAddSpaceUnCheckedWorkspace")) : d.globalCheck.addClass("entryVariableAddChecked");
};
Entry.VariableContainer.prototype.select = function(b) {
  b = this.selected == b ? null : b;
  this.selected && (this.selected.listElement.removeClass("selected"), this.selected.callerListElement && (this.listView_.removeChild(this.selected.callerListElement), delete this.selected.callerListElement), this.selected = null);
  b && (b.listElement.addClass("selected"), this.selected = b, b instanceof Entry.Variable ? (this.renderVariableReference(b), b.object_ && Entry.container.selectObject(b.object_, !0)) : b instanceof Entry.Func ? this.renderFunctionReference(b) : this.renderMessageReference(b));
};
Entry.VariableContainer.prototype.getMessage = function(b) {
  return this.messages_.filter(function(a) {
    return a.id === b;
  })[0];
};
Entry.VariableContainer.prototype.renderMessageReference = function(b) {
  for (var a = this, d = this._messageRefs, c = b.id, e = [], f = 0;f < d.length;f++) {
    -1 < d[f].block.params.indexOf(c) && e.push(d[f]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var c = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(c.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = c.object.name + " : " + Lang.Blocks["START_" + c.block.type];
    g.appendChild(h);
    g.caller = c;
    g.message = b;
    g.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(this.message));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  b.callerListElement = d;
  this.listView_.insertBefore(d, b.listElement);
  this.listView_.insertBefore(b.listElement, d);
};
Entry.VariableContainer.prototype.renderVariableReference = function(b) {
  for (var a = this, d = this._variableRefs, c = b.id_, e = [], f = 0;f < d.length;f++) {
    -1 < d[f].block.params.indexOf(c) && e.push(d[f]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var c = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(c.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = c.object.name + " : " + Lang.Blocks["VARIABLE_" + c.block.type];
    g.appendChild(h);
    g.caller = c;
    g.variable = b;
    g.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null));
      b = this.caller;
      b = b.funcBlock || b.block;
      b.view.getBoard().activateBlock(b);
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  b.callerListElement = d;
  this.listView_.insertBefore(d, b.listElement);
  this.listView_.insertBefore(b.listElement, d);
};
Entry.VariableContainer.prototype.renderFunctionReference = function(b) {
  for (var a = this, d = this._functionRefs, c = [], e = 0;e < d.length;e++) {
    c.push(d[e]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (e in c) {
    var f = c[e], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(f.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = f.object.name;
    g.appendChild(h);
    g.caller = f;
    g.bindOnClick(function(c) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(b));
      c = this.caller.block;
      Entry.playground.toggleOnVariableView();
      c.view.getBoard().activateBlock(c);
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === c.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  b.callerListElement = d;
  this.listView_.insertBefore(d, b.listElement);
  this.listView_.insertBefore(b.listElement, d);
};
Entry.VariableContainer.prototype.updateList = function() {
  if (this.listView_) {
    this.variableSettingView.addClass("entryRemove");
    for (this.listSettingView.addClass("entryRemove");this.listView_.firstChild;) {
      this.listView_.removeChild(this.listView_.firstChild);
    }
    var b = this.viewMode_, a = [];
    if ("all" == b || "message" == b) {
      "message" == b && this.listView_.appendChild(this.messageAddButton_);
      for (var d in this.messages_) {
        var c = this.messages_[d];
        a.push(c);
        var e = c.listElement;
        this.listView_.appendChild(e);
        c.callerListElement && this.listView_.appendChild(c.callerListElement);
      }
    }
    if ("all" == b || "variable" == b) {
      if ("variable" == b) {
        e = this.variableAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.variableAddButton_);
        this.listView_.appendChild(this.variableAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.Variable_used_at_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        for (d in this.variables_) {
          c = this.variables_[d], c.object_ || (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.Variable_used_at_special_object;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (d in this.variables_) {
          c = this.variables_[d], c.object_ && (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (d in this.variables_) {
          c = this.variables_[d], a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement);
        }
      }
    }
    if ("all" == b || "list" == b) {
      if ("list" == b) {
        e = this.listAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.listAddButton_);
        this.listView_.appendChild(this.listAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.List_used_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        this.updateVariableAddView("list");
        for (d in this.lists_) {
          c = this.lists_[d], c.object_ || (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.list_used_specific_objects;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (d in this.lists_) {
          c = this.lists_[d], c.object_ && (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (d in this.lists_) {
          c = this.lists_[d], a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement);
        }
      }
    }
    if ("all" == b || "func" == b) {
      for (d in "func" == b && (b = Entry.Workspace.MODE_BOARD, Entry.playground && Entry.playground.mainWorkspace && (b = Entry.playground.mainWorkspace.getMode()), b === Entry.Workspace.MODE_OVERLAYBOARD ? this.functionAddButton_.addClass("disable") : this.functionAddButton_.removeClass("disable"), this.listView_.appendChild(this.functionAddButton_)), this.functions_) {
        b = this.functions_[d], a.push(b), e = b.listElement, this.listView_.appendChild(e), b.callerListElement && this.listView_.appendChild(b.callerListElement);
      }
    }
    this.listView_.appendChild(this.variableSettingView);
    this.listView_.appendChild(this.listSettingView);
  }
};
Entry.VariableContainer.prototype.setMessages = function(b) {
  for (var a in b) {
    var d = b[a];
    d.id || (d.id = Entry.generateHash());
    this.createMessageView(d);
    this.messages_.push(d);
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setVariables = function(b) {
  for (var a in b) {
    var d = new Entry.Variable(b[a]), c = d.getType();
    "variable" == c || "slide" == c ? (d.generateView(this.variables_.length), this.createVariableView(d), this.variables_.push(d)) : "list" == c ? (d.generateView(this.lists_.length), this.createListView(d), this.lists_.push(d)) : "timer" == c ? this.generateTimer(d) : "answer" == c && this.generateAnswer(d);
  }
  Entry.isEmpty(Entry.engine.projectTimer) && Entry.variableContainer.generateTimer();
  Entry.isEmpty(Entry.container.inputValue) && Entry.variableContainer.generateAnswer();
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setFunctions = function(b) {
  for (var a in b) {
    var d = new Entry.Func(b[a]);
    d.generateBlock();
    this.createFunctionView(d);
    this.functions_[d.id] = d;
  }
  this.updateList();
};
Entry.VariableContainer.prototype.getFunction = function(b) {
  return this.functions_[b];
};
Entry.VariableContainer.prototype.getVariable = function(b, a) {
  var d = Entry.findObjsByKey(this.variables_, "id_", b)[0];
  a && a.isClone && d.object_ && (d = Entry.findObjsByKey(a.variables, "id_", b)[0]);
  return d;
};
Entry.VariableContainer.prototype.getList = function(b, a) {
  var d = Entry.findObjsByKey(this.lists_, "id_", b)[0];
  a && a.isClone && d.object_ && (d = Entry.findObjsByKey(a.lists, "id_", b)[0]);
  return d;
};
Entry.VariableContainer.prototype.createFunction = function() {
  if (!Entry.Func.isEdit) {
    var b = new Entry.Func;
    Entry.Func.edit(b);
  }
};
Entry.VariableContainer.prototype.addFunction = function(b) {
};
Entry.VariableContainer.prototype.removeFunction = function(b) {
  var a = b.id;
  b = this.functions_;
  b[a].destroy();
  delete b[a];
  a = "func_" + a;
  Entry.container.removeFuncBlocks(a);
  for (var d in b) {
    b[d].content.removeBlocksByType(a);
  }
  this.updateList();
};
Entry.VariableContainer.prototype.checkListPosition = function(b, a) {
  var d = b.x_ + b.width_, c = -b.y_, e = -b.y_ + -b.height_;
  return a.x > b.x_ && a.x < d && a.y < c && a.y > e ? !0 : !1;
};
Entry.VariableContainer.prototype.getListById = function(b) {
  var a = this.lists_, d = [];
  if (0 < a.length) {
    for (var c = 0;c < a.length;c++) {
      this.checkListPosition(a[c], b) && d.push(a[c]);
    }
    return d;
  }
  return !1;
};
Entry.VariableContainer.prototype.editFunction = function(b, a) {
};
Entry.VariableContainer.prototype.saveFunction = function(b) {
  this.functions_[b.id] || (this.functions_[b.id] = b, this.createFunctionView(b));
  b.listElement.nameField.innerHTML = b.description;
  this.updateList();
};
Entry.VariableContainer.prototype.createFunctionView = function(b) {
  var a = this;
  if (this.view_) {
    var d = Entry.createElement("li");
    d.addClass("entryVariableListElementWorkspace");
    d.addClass("entryFunctionElementWorkspace");
    d.bindOnClick(function(c) {
      c.stopPropagation();
      a.select(b);
    });
    var c = Entry.createElement("button");
    c.addClass("entryVariableListElementDeleteWorkspace");
    c.bindOnClick(function(c) {
      c.stopPropagation();
      confirm(Lang.Workspace.will_you_delete_function) && (a.removeFunction(b), a.selected = null);
    });
    var e = Entry.createElement("button");
    e.addClass("entryVariableListElementEditWorkspace");
    var f = this._getBlockMenu();
    e.bindOnClick(function(a) {
      a.stopPropagation();
      if (a = Entry.playground) {
        a.changeViewMode("code"), "func" != f.lastSelector && f.selectMenu("func");
      }
      Entry.Func.edit(b);
    });
    var g = Entry.createElement("div");
    g.addClass("entryVariableFunctionElementNameWorkspace");
    g.innerHTML = b.description;
    d.nameField = g;
    d.appendChild(g);
    d.appendChild(e);
    d.appendChild(c);
    b.listElement = d;
  }
};
Entry.VariableContainer.prototype.checkAllVariableName = function(b, a) {
  a = this[a];
  for (var d = 0;d < a.length;d++) {
    if (a[d].name_ == b) {
      return !0;
    }
  }
  return !1;
};
Entry.VariableContainer.prototype.addVariable = function(b) {
  if (!b) {
    var a = this.variableAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.variable);
    b.length > this._maxNameLength && (b = this._truncName(b, "variable"));
    b = this.checkAllVariableName(b, "variables_") ? Entry.getOrderedName(b, this.variables_, "name_") : b;
    var d = a.info;
    b = {name:b, isCloud:d.isCloud, object:d.object, variableType:"variable"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("variable");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add variable", this, this.removeVariable, b);
  b.generateView(this.variables_.length);
  this.createVariableView(b);
  this.variables_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removeVariable, b);
};
Entry.VariableContainer.prototype.removeVariable = function(b) {
  var a = this.variables_.indexOf(b), d = b.toJSON();
  this.selected == b && this.select(null);
  b.remove();
  this.variables_.splice(a, 1);
  Entry.stateManager && Entry.stateManager.addCommand("remove variable", this, this.addVariable, d);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addVariable, d);
};
Entry.VariableContainer.prototype.changeVariableName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.variables_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_too_long)) : (b.setName(a), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.variable_rename, Lang.Workspace.variable_rename_ok)));
};
Entry.VariableContainer.prototype.changeListName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.lists_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_too_long)) : (b.name_ = a, b.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.list_rename, Lang.Workspace.list_rename_ok)));
};
Entry.VariableContainer.prototype.removeList = function(b) {
  var a = this.lists_.indexOf(b), d = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove list", this, this.addList, d);
  this.selected == b && this.select(null);
  b.remove();
  this.lists_.splice(a, 1);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addList, d);
};
Entry.VariableContainer.prototype.createVariableView = function(b) {
  var a = this, d = Entry.createElement("li"), c = Entry.createElement("div");
  c.addClass("entryVariableListElementWrapperWorkspace");
  d.appendChild(c);
  d.addClass("entryVariableListElementWorkspace");
  b.object_ ? d.addClass("entryVariableLocalElementWorkspace") : b.isCloud_ ? d.addClass("entryVariableCloudElementWorkspace") : d.addClass("entryVariableGlobalElementWorkspace");
  d.bindOnClick(function(c) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeVariable(b);
    a.selectedVariable = null;
    a.variableSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  d.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(b) {
    b.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(null, "variable");
  });
  d.editSaveButton = g;
  var h = Entry.createElement("input");
  h.addClass("entryVariableListElementNameWorkspace");
  h.setAttribute("disabled", "disabled");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? a.changeVariableName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.variable_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.nameField = h;
  c.appendChild(h);
  c.appendChild(f);
  c.appendChild(g);
  c.appendChild(e);
  b.listElement = d;
};
Entry.VariableContainer.prototype.addMessage = function(b) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add message", this, this.removeMessage, b);
  this.createMessageView(b);
  this.messages_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  b.listElement.nameField.focus();
  return new Entry.State(this, this.removeMessage, b);
};
Entry.VariableContainer.prototype.removeMessage = function(b) {
  this.selected == b && this.select(null);
  Entry.stateManager && Entry.stateManager.addCommand("remove message", this, this.addMessage, b);
  var a = this.messages_.indexOf(b);
  this.messages_.splice(a, 1);
  this.updateList();
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addMessage, b);
};
Entry.VariableContainer.prototype.changeMessageName = function(b, a) {
  b.name != a && (Entry.isExist(a, "name", this.messages_) ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_too_long)) : (b.name = a, Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.message_rename, Lang.Workspace.message_rename_ok)));
};
Entry.VariableContainer.prototype.createMessageView = function(b) {
  var a = this, d = Entry.createElement("li");
  d.addClass("entryVariableListElementWorkspace");
  d.addClass("entryMessageElementWorkspace");
  d.bindOnClick(function(c) {
    a.select(b);
  });
  var c = Entry.createElement("button");
  c.addClass("entryVariableListElementDeleteWorkspace");
  c.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeMessage(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementEditWorkspace");
  e.bindOnClick(function(a) {
    a.stopPropagation();
    g.removeAttribute("disabled");
    g.focus();
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.addClass("entryRemove");
  f.bindOnClick(function(a) {
    a.stopPropagation();
    g.blur();
    e.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var g = Entry.createElement("input");
  g.addClass("entryVariableListElementNameWorkspace");
  g.value = b.name;
  g.bindOnClick(function(a) {
    a.stopPropagation();
  });
  g.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? (a.changeMessageName(b, this.value), e.removeClass("entryRemove"), f.addClass("entryRemove"), g.setAttribute("disabled", "disabled")) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.sign_can_not_space), this.value = b.name);
  };
  g.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.nameField = g;
  d.appendChild(g);
  d.appendChild(e);
  d.appendChild(f);
  d.appendChild(c);
  b.listElement = d;
};
Entry.VariableContainer.prototype.addList = function(b) {
  if (!b) {
    var a = this.listAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.list);
    var d = a.info;
    b.length > this._maxNameLength && (b = this._truncName(b, "list"));
    b = this.checkAllVariableName(b, "lists_") ? Entry.getOrderedName(b, this.lists_, "name_") : b;
    b = {name:b, isCloud:d.isCloud, object:d.object, variableType:"list"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("list");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add list", this, this.removeList, b);
  b.generateView(this.lists_.length);
  this.createListView(b);
  this.lists_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removelist, b);
};
Entry.VariableContainer.prototype.createListView = function(b) {
  var a = this, d = Entry.createElement("li"), c = Entry.createElement("div");
  c.addClass("entryVariableListElementWrapperWorkspace");
  d.appendChild(c);
  d.addClass("entryVariableListElementWorkspace");
  b.object_ ? d.addClass("entryListLocalElementWorkspace") : b.isCloud_ ? d.addClass("entryListCloudElementWorkspace") : d.addClass("entryListGlobalElementWorkspace");
  d.bindOnClick(function(c) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    a.removeList(b);
    a.selectedList = null;
    a.listSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  d.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(c) {
    c.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.select(b);
    a.updateSelectedVariable(null, "list");
  });
  d.editSaveButton = g;
  var h = Entry.createElement("input");
  h.setAttribute("disabled", "disabled");
  h.addClass("entryVariableListElementNameWorkspace");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? a.changeListName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.list_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.nameField = h;
  c.appendChild(h);
  c.appendChild(f);
  c.appendChild(g);
  c.appendChild(e);
  b.listElement = d;
};
Entry.VariableContainer.prototype.mapVariable = function(b, a) {
  for (var d = this.variables_.length, c = 0;c < d;c++) {
    b(this.variables_[c], a);
  }
};
Entry.VariableContainer.prototype.mapList = function(b, a) {
  for (var d = this.lists_.length, c = 0;c < d;c++) {
    b(this.lists_[c], a);
  }
};
Entry.VariableContainer.prototype.getVariableJSON = function() {
  for (var b = [], a = 0;a < this.variables_.length;a++) {
    b.push(this.variables_[a].toJSON());
  }
  for (a = 0;a < this.lists_.length;a++) {
    b.push(this.lists_[a].toJSON());
  }
  Entry.engine.projectTimer && b.push(Entry.engine.projectTimer.toJSON());
  a = Entry.container.inputValue;
  Entry.isEmpty(a) || b.push(a.toJSON());
  return b;
};
Entry.VariableContainer.prototype.getMessageJSON = function() {
  for (var b = [], a = 0;a < this.messages_.length;a++) {
    b.push({id:this.messages_[a].id, name:this.messages_[a].name});
  }
  return b;
};
Entry.VariableContainer.prototype.getFunctionJSON = function() {
  var b = [], a;
  for (a in this.functions_) {
    var d = this.functions_[a], d = {id:d.id, content:JSON.stringify(d.content.toJSON())};
    b.push(d);
  }
  return b;
};
Entry.VariableContainer.prototype.resetVariableAddPanel = function(b) {
  b = b || "variable";
  var a = "variable" == b ? this.variableAddPanel : this.listAddPanel, d = a.info;
  d.isCloud = !1;
  d.object = null;
  a.view.name.value = "";
  a.isOpen = !1;
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.generateVariableAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.variableAddPanel.view = a;
  this.variableAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  a.appendChild(d);
  var c = Entry.createElement("input");
  c.addClass("entryVariableAddSpaceInputWorkspace");
  c.setAttribute("placeholder", Lang.Workspace.Variable_placeholder_name);
  c.variableContainer = this;
  c.onkeypress = function(a) {
    13 == a.keyCode && (Entry.variableContainer.addVariable(), b.updateSelectedVariable(b.variables_[0]), a = b.variables_[0].listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"));
  };
  this.variableAddPanel.view.name = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  d.bindOnClick(function(a) {
    b.variableAddPanel.info.object = null;
    b.updateVariableAddView("variable");
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_all_objects;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.globalCheck = c;
  this.variableAddPanel.info.object || c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  d.bindOnClick(function(a) {
    Entry.playground.object && (a = b.variableAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("variable"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_this_object;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.localCheck = c;
  this.variableAddPanel.info.object && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  a.cloudWrapper = d;
  d.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.variableAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("variable"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  c.innerHTML = Lang.Workspace.Variable_create_cloud;
  d.appendChild(c);
  c = Entry.createElement("span");
  this.variableAddPanel.view.cloudCheck = c;
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  c.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.variableAddPanel.info.isCloud && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(d);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.variableAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("variable");
  });
  d.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    Entry.variableContainer.addVariable();
    b.updateSelectedVariable(b.variables_[0]);
    a = b.variables_[0].listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
  });
  d.appendChild(a);
};
Entry.VariableContainer.prototype.generateListAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.listAddPanel.view = a;
  this.listAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  d.addClass("entryListAddSpaceNameWrapperWorkspace");
  a.appendChild(d);
  var c = Entry.createElement("input");
  c.addClass("entryVariableAddSpaceInputWorkspace");
  c.setAttribute("placeholder", Lang.Workspace.list_name);
  this.listAddPanel.view.name = c;
  c.variableContainer = this;
  c.onkeypress = function(a) {
    13 == a.keyCode && (b.addList(), a = b.lists_[0], b.updateSelectedVariable(a), a = a.listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"));
  };
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  d.bindOnClick(function(a) {
    b.listAddPanel.info.object = null;
    b.updateVariableAddView("list");
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.use_all_objects;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.globalCheck = c;
  this.listAddPanel.info.object || c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  d.bindOnClick(function(a) {
    Entry.playground.object && (a = b.listAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("list"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_this_object;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.localCheck = c;
  this.variableAddPanel.info.object && addVariableLocalCheck.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  a.cloudWrapper = d;
  d.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.listAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("list"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  c.innerHTML = Lang.Workspace.List_create_cloud;
  d.appendChild(c);
  c = Entry.createElement("span");
  this.listAddPanel.view.cloudCheck = c;
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  c.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.listAddPanel.info.isCloud && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(d);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.listAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("list");
  });
  d.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    b.addList();
    a = b.lists_[0];
    b.updateSelectedVariable(a);
    a = a.listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
  });
  d.appendChild(a);
};
Entry.VariableContainer.prototype.generateVariableSplitterView = function() {
  var b = Entry.createElement("li");
  b.addClass("entryVariableSplitterWorkspace");
  var a = Entry.createElement("li");
  a.addClass("entryVariableSplitterWorkspace");
  this.variableSplitters = {top:b, bottom:a};
};
Entry.VariableContainer.prototype.openVariableAddPanel = function(b) {
  b = b ? b : "variable";
  Entry.playground.toggleOnVariableView();
  Entry.playground.changeViewMode("variable");
  "variable" == b ? this.variableAddPanel.isOpen = !0 : this.listAddPanel.isOpen = !0;
  this.selectFilter(b);
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.getMenuXml = function(b) {
  for (var a = [], d = 0 !== this.variables_.length, c = 0 !== this.lists_.length, e, f = 0, g;g = b[f];f++) {
    var h = g.tagName;
    h && "BLOCK" == h.toUpperCase() ? (e = g.getAttribute("bCategory"), !d && "variable" == e || !c && "list" == e || a.push(g)) : !h || "SPLITTER" != h.toUpperCase() && "BTN" != h.toUpperCase() || !d && "variable" == e || (c || "list" != e) && a.push(g);
  }
  return a;
};
Entry.VariableContainer.prototype.addCloneLocalVariables = function(b) {
  var a = [], d = this;
  this.mapVariable(function(b, d) {
    if (b.object_ && b.object_ == d.objectId) {
      var f = b.toJSON();
      f.originId = f.id;
      f.id = Entry.generateHash();
      f.object = d.newObjectId;
      delete f.x;
      delete f.y;
      a.push(f);
      d.json.script = d.json.script.replace(new RegExp(f.originId, "g"), f.id);
    }
  }, b);
  a.map(function(a) {
    d.addVariable(a);
  });
};
Entry.VariableContainer.prototype.generateTimer = function(b) {
  b || (b = {}, b.id = Entry.generateHash(), b.name = Lang.Workspace.Variable_Timer, b.value = 0, b.variableType = "timer", b.visible = !1, b.x = 150, b.y = -70, b = new Entry.Variable(b));
  b.generateView();
  b.tick = null;
  Entry.engine.projectTimer = b;
  Entry.addEventListener("stop", function() {
    Entry.engine.stopProjectTimer();
  });
};
Entry.VariableContainer.prototype.generateAnswer = function(b) {
  b || (b = new Entry.Variable({id:Entry.generateHash(), name:Lang.Blocks.VARIABLE_get_canvas_input_value, value:0, variableType:"answer", visible:!1, x:150, y:-100}));
  b.generateView();
  Entry.container.inputValue = b;
};
Entry.VariableContainer.prototype.generateVariableSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.variableSettingView = a;
  a.addClass("entryVariableSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableSettingVisibleWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.selectedVariable;
    var c = b.variableSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? c.addClass("entryVariableSettingChecked") : c.removeClass("entryVariableSettingChecked");
  });
  a.appendChild(d);
  var c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.show_variable;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableSettingCheckWorkspace");
  a.visibleCheck = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingInitValueWrapperWorkspace");
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.default_value;
  d.appendChild(c);
  c = Entry.createElement("input");
  c.addClass("entryVariableSettingInitValueInputWorkspace");
  a.initValueInput = c;
  c.value = 0;
  c.onkeyup = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  c.onblur = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  a.initValueInput = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingSplitterWorkspace");
  a.appendChild(d);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingSlideWrapperWorkspace");
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.slide;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableSettingCheckWorkspace");
  a.slideCheck = c;
  d.appendChild(c);
  d.bindOnClick(function(a) {
    var c;
    a = b.selectedVariable;
    var d = b.variables_, f = a.getType();
    "variable" == f ? (c = a.toJSON(), c.variableType = "slide", c = new Entry.Variable(c), d.splice(d.indexOf(a), 0, c), 0 > c.getValue() && c.setValue(0), 100 < c.getValue() && c.setValue(100), e.removeAttribute("disabled"), g.removeAttribute("disabled")) : "slide" == f && (c = a.toJSON(), c.variableType = "variable", c = new Entry.Variable(c), d.splice(d.indexOf(a), 0, c), e.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
    b.createVariableView(c);
    b.removeVariable(a);
    b.updateSelectedVariable(c);
    c.generateView();
  });
  d = Entry.createElement("div");
  a.minMaxWrapper = d;
  d.addClass("entryVariableSettingMinMaxWrapperWorkspace");
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.min_value;
  d.appendChild(c);
  var e = Entry.createElement("input");
  e.addClass("entryVariableSettingMinValueInputWorkspace");
  c = b.selectedVariable;
  e.value = c && "slide" == c.type ? c.minValue_ : 0;
  e.onkeypress = function(a) {
    13 === a.keyCode && this.blur();
  };
  e.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMinValue(this.value), b.updateVariableSettingView(a));
  };
  a.minValueInput = e;
  d.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entryVariableSettingMaxValueSpanWorkspace");
  f.innerHTML = Lang.Workspace.max_value;
  d.appendChild(f);
  var g = Entry.createElement("input");
  g.addClass("entryVariableSettingMaxValueInputWorkspace");
  g.value = c && "slide" == c.type ? c.maxValue_ : 100;
  g.onkeypress = function(a) {
    13 === a.keyCode && this.blur();
  };
  g.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMaxValue(this.value), b.updateVariableSettingView(a));
  };
  a.maxValueInput = g;
  d.appendChild(g);
};
Entry.VariableContainer.prototype.updateVariableSettingView = function(b) {
  var a = this.variableSettingView, d = a.visibleCheck, c = a.initValueInput, e = a.slideCheck, f = a.minValueInput, g = a.maxValueInput, h = a.minMaxWrapper;
  d.removeClass("entryVariableSettingChecked");
  b.isVisible() && d.addClass("entryVariableSettingChecked");
  e.removeClass("entryVariableSettingChecked");
  "slide" == b.getType() ? (e.addClass("entryVariableSettingChecked"), f.removeAttribute("disabled"), g.removeAttribute("disabled"), f.value = b.getMinValue(), g.value = b.getMaxValue(), h.removeClass("entryVariableMinMaxDisabledWorkspace")) : (h.addClass("entryVariableMinMaxDisabledWorkspace"), f.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
  c.value = b.getValue();
  b.listElement.appendChild(a);
  a.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.generateListSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.listSettingView = a;
  a.addClass("entryListSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryListSettingVisibleWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.selectedList;
    var c = b.listSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? c.addClass("entryListSettingCheckedWorkspace") : c.removeClass("entryListSettingCheckedWorkspace");
  });
  a.appendChild(d);
  var c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.show_list_workspace;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryListSettingCheckWorkspace");
  a.visibleCheck = c;
  d.appendChild(c);
  c = Entry.createElement("div");
  c.addClass("entryListSettingLengthWrapperWorkspace");
  d = Entry.createElement("span");
  d.addClass("entryListSettingLengthSpanWorkspace");
  d.innerHTML = Lang.Workspace.number_of_list;
  c.appendChild(d);
  a.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryListSettingLengthControllerWorkspace");
  c.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryListSettingMinusWorkspace");
  c.bindOnClick(function(a) {
    b.selectedList.array_.pop();
    b.updateListSettingView(b.selectedList);
  });
  d.appendChild(c);
  c = Entry.createElement("input");
  c.addClass("entryListSettingLengthInputWorkspace");
  c.onblur = function() {
    b.setListLength(this.value);
  };
  c.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.lengthInput = c;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryListSettingPlusWorkspace");
  c.bindOnClick(function(a) {
    b.selectedList.array_.push({data:0});
    b.updateListSettingView(b.selectedList);
  });
  d.appendChild(c);
  d = Entry.createElement("div");
  a.seperator = d;
  a.appendChild(d);
  d.addClass("entryListSettingSeperatorWorkspace");
  d = Entry.createElement("div");
  d.addClass("entryListSettingListValuesWorkspace");
  a.listValues = d;
  a.appendChild(d);
};
Entry.VariableContainer.prototype.updateListSettingView = function(b) {
  var a = this;
  b = b || this.selectedList;
  var d = this.listSettingView, c = d.listValues, e = d.visibleCheck, f = d.lengthInput, g = d.seperator;
  e.removeClass("entryListSettingCheckedWorkspace");
  b.isVisible() && e.addClass("entryListSettingCheckedWorkspace");
  f.value = b.array_.length;
  for (b.listElement.appendChild(d);c.firstChild;) {
    c.removeChild(c.firstChild);
  }
  var h = b.array_;
  0 === h.length ? g.addClass("entryRemove") : g.removeClass("entryRemove");
  for (e = 0;e < h.length;e++) {
    (function(d) {
      var e = Entry.createElement("div");
      e.addClass("entryListSettingValueWrapperWorkspace");
      var f = Entry.createElement("span");
      f.addClass("entryListSettingValueNumberSpanWorkspace");
      f.innerHTML = d + 1;
      e.appendChild(f);
      f = Entry.createElement("input");
      f.value = h[d].data;
      f.onblur = function() {
        h[d].data = this.value;
        b.updateView();
      };
      f.onkeypress = function(a) {
        13 == a.keyCode && this.blur();
      };
      f.addClass("entryListSettingEachInputWorkspace");
      e.appendChild(f);
      f = Entry.createElement("span");
      f.bindOnClick(function() {
        h.splice(d, 1);
        a.updateListSettingView();
      });
      f.addClass("entryListSettingValueRemoveWorkspace");
      e.appendChild(f);
      c.appendChild(e);
    })(e);
  }
  b.updateView();
  d.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.setListLength = function(b) {
  b = Number(b);
  var a = this.selectedList.array_;
  if (!isNaN(b)) {
    var d = a.length;
    if (d < b) {
      for (b -= d, d = 0;d < b;d++) {
        a.push({data:0});
      }
    } else {
      d > b && (a.length = b);
    }
  }
  this.updateListSettingView();
};
Entry.VariableContainer.prototype.updateViews = function() {
  var b = this.lists_;
  this.variables_.map(function(a) {
    a.updateView();
  });
  b.map(function(a) {
    a.updateView();
  });
};
Entry.VariableContainer.prototype.updateSelectedVariable = function(b, a) {
  b ? "variable" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "slide" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "list" == b.type && (this.selectedList = b, this.updateListSettingView(b)) : (this.selectedVariable = null, "variable" == (a || "variable") ? this.variableSettingView.addClass("entryRemove") : this.listSettingView.addClass("entryRemove"));
};
Entry.VariableContainer.prototype.removeLocalVariables = function(b) {
  var a = [], d = this;
  this.mapVariable(function(b, d) {
    b.object_ && b.object_ == d && a.push(b);
  }, b);
  a.map(function(a) {
    d.removeVariable(a);
  });
};
Entry.VariableContainer.prototype.updateCloudVariables = function() {
  var b = Entry.projectId;
  if (Entry.cloudSavable && b) {
    var a = Entry.variableContainer, b = a.variables_.filter(function(a) {
      return a.isCloud_;
    }), b = b.map(function(a) {
      return a.toJSON();
    }), a = a.lists_.filter(function(a) {
      return a.isCloud_;
    }), a = a.map(function(a) {
      return a.toJSON();
    });
    $.ajax({url:"/api/project/variable/" + Entry.projectId, type:"PUT", data:{variables:b, lists:a}}).done(function() {
    });
  }
};
Entry.VariableContainer.prototype.addRef = function(b, a) {
  if (this.view_ && Entry.playground.mainWorkspace && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    var d = {object:a.getCode().object, block:a};
    a.funcBlock && (d.funcBlock = a.funcBlock, delete a.funcBlock);
    this[b].push(d);
    if ("_functionRefs" == b) {
      for (var c = a.type.substr(5), e = Entry.variableContainer.functions_[c].content.getBlockList(), f = 0;f < e.length;f++) {
        a = e[f];
        var g = a.events;
        -1 < a.type.indexOf("func_") && a.type.substr(5) == c || (g && g.viewAdd && g.viewAdd.forEach(function(b) {
          a.getCode().object = d.object;
          b && (a.funcBlock = d.block, b(a));
        }), g && g.dataAdd && g.dataAdd.forEach(function(b) {
          a.getCode().object = d.object;
          b && (a.funcBlock = d.block, b(a));
        }));
      }
    }
    return d;
  }
};
Entry.VariableContainer.prototype.removeRef = function(b, a) {
  if (Entry.playground.mainWorkspace && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    for (var d = this[b], c = 0;c < d.length;c++) {
      if (d[c].block == a) {
        d.splice(c, 1);
        break;
      }
    }
    if ("_functionRefs" == b && (d = a.type.substr(5), c = Entry.variableContainer.functions_[d])) {
      for (var e = c.content.getBlockList(), c = 0;c < e.length;c++) {
        a = e[c];
        var f = a.events;
        -1 < a.type.indexOf("func_") && a.type.substr(5) == d || (f && f.viewDestroy && f.viewDestroy.forEach(function(b) {
          b && b(a);
        }), f && f.dataDestroy && f.dataDestroy.forEach(function(b) {
          b && b(a);
        }));
      }
    }
  }
};
Entry.VariableContainer.prototype._getBlockMenu = function() {
  return Entry.playground.mainWorkspace.getBlockMenu();
};
Entry.VariableContainer.prototype._truncName = function(b, a) {
  b = b.substring(0, this._maxNameLength);
  Entry.toast.warning(Lang.Workspace[a + "_name_auto_edited_title"], Lang.Workspace[a + "_name_auto_edited_content"]);
  return b;
};
Entry.VariableContainer.prototype._maxNameLength = 10;
Entry.VariableContainer.prototype.clear = function() {
  this.variables_.map(function(a) {
    a.remove();
  });
  this.variables_ = [];
  this.lists_.map(function(a) {
    a.remove();
  });
  this.lists_ = [];
  this.messages_ = [];
  for (var b in this.functions_) {
    this.functions_[b].destroy(), delete this.functions_[b];
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.block.run = {skeleton:"basic", color:"#3BBD70", contents:["this is", "basic block"], func:function() {
}};
Entry.block.mutant = {skeleton:"basic", event:"start", color:"#3BBD70", template:"test mutant block", params:[], func:function() {
}, changeEvent:new Entry.Event};
Entry.block.jr_start = {skeleton:"pebble_event", event:"start", color:"#3BBD70", template:"%1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_play_image.png", highlightColor:"#3BBD70", position:{x:0, y:0}, size:22}], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_repeat = {skeleton:"pebble_loop", color:"#127CDB", template:"%1 \ubc18\ubcf5", params:[{type:"Text", text:Lang.Menus.repeat_0}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:3, fontSize:14, roundValue:3}, {type:"Text", text:Lang.Menus.repeat_1}], statements:[], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var b = this.block.statements[0];
    if (0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.jr_item = {skeleton:"pebble_basic", color:"#F46C6C", template:"\uaf43 \ubaa8\uc73c\uae30 %1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_item_image.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.cparty_jr_item = {skeleton:"pebble_basic", color:"#8ABC1D", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.pick_up_pencil}, {type:"Indicator", img:"/img/assets/ntry/bitmap/cpartyjr/pen.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_north = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_up}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_up_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case Ntry.STATIC.EAST:
        c = b.TURN_LEFT;
        break;
      case Ntry.STATIC.SOUTH:
        c = b.HALF_ROTATION;
        break;
      case Ntry.STATIC.WEST:
        c = b.TURN_RIGHT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_east = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_right}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_right_image.png", position:{x:83, y:0}, size:22}], func:function() {
  var b = Ntry.STATIC;
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        c = b.TURN_LEFT;
        break;
      case b.WEST:
        c = b.HALF_ROTATION;
        break;
      case b.NORTH:
        c = b.TURN_RIGHT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_south = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_down}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_down_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case b.EAST:
        c = b.TURN_RIGHT;
        break;
      case b.NORTH:
        c = b.HALF_ROTATION;
        break;
      case b.WEST:
        c = b.TURN_LEFT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_west = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_left}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_left_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        c = b.TURN_RIGHT;
        break;
      case b.EAST:
        c = b.HALF_ROTATION;
        break;
      case b.NORTH:
        c = b.TURN_LEFT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_start_basic = {skeleton:"basic_event", event:"start", color:"#3BBD70", template:"%1 %2", params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}, Lang.Menus.maze_when_run], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_go_straight = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.go_forward, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_straight.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_left = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_left, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_l.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_right = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_right, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_r.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_go_slow = {skeleton:"basic", color:"#f46c6c", template:"%1 %2", params:[Lang.Menus.go_slow, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_slow.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GO_SLOW, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_repeat_until_dest = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", syntax:["BasicWhile", "true"], params:[Lang.Menus.repeat_until_reach_2, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_goal_image.png", size:18}, Lang.Menus.repeat_until_reach_1, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_if_construction = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", params:[Lang.Menus.jr_if_1, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_construction_image.png", size:18}, Lang.Menus.jr_if_2, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_REPAIR});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.jr_if_speed = {skeleton:"basic_loop", color:"#498DEB", template:Lang.Menus.jr_if_1 + " %1 " + Lang.Menus.jr_if_2 + " %2", params:[{type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_speed_image.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_SLOW});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_start = {skeleton:"basic_event", mode:"maze", event:"start", color:"#3BBD70", template:"%1 \uc2dc\uc791\ud558\uae30\ub97c \ud074\ub9ad\ud588\uc744 \ub54c", syntax:["Program"], params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.maze_step_jump = {skeleton:"basic", mode:"maze", color:"#FF6E4B", template:"\ub6f0\uc5b4\ub118\uae30%1", params:[{type:"Image", img:"/img/assets/week/blocks/jump.png", size:24}], syntax:["Scope", "jump"], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.JUMP, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_for = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ubc88 \ubc18\ubcf5\ud558\uae30%2", syntax:["BasicIteration"], params:[{type:"Dropdown", key:"REPEAT", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var b = this.block.statements[0];
    if (0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.test = {skeleton:"basic_boolean_field", mode:"maze", color:"#127CDB", template:"%1 this is test block %2", params:[{type:"Angle", value:"90"}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.maze_repeat_until_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_repeat_until_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ubaa8\ub4e0 %1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    d = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y});
    b = this.block.statements[0];
    if (0 === d.length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "bee"'], params:[{type:"Image", img:"/img/assets/ntry/bitmap/maze2/obstacle_01.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BEE});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_call_function = {skeleton:"basic", mode:"maze", color:"#B57242", template:"\uc57d\uc18d \ubd88\ub7ec\uc624\uae30%1", syntax:["Scope", "promise"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], func:function() {
  if (!this.funcExecutor) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.CODE), a;
    for (a in b) {
      this.funcExecutor = new Entry.Executor(b[a].components[Ntry.STATIC.CODE].code.getEventMap("define")[0]);
    }
  }
  this.funcExecutor.execute();
  if (null !== this.funcExecutor.scope.block) {
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_define_function = {skeleton:"basic_define", mode:"maze", color:"#B57242", event:"define", template:"\uc57d\uc18d\ud558\uae30%1", syntax:["BasicFunction"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], statements:[{accept:"basic"}], func:function(b) {
  if (!this.executed && (b = this.block.statements[0], 0 !== b.getBlocks().length)) {
    return this.executor.stepInto(b), this.executed = !0, Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_3 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "banana"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_3.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BANANA});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_4 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_2.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_move_step = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc55e\uc73c\ub85c \ud55c \uce78 \uc774\ub3d9%1", syntax:["Scope", "move"], params:[{type:"Image", img:"/img/assets/week/blocks/moveStep.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_left = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc67c\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "left"], params:[{type:"Image", img:"/img/assets/week/blocks/turnL.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_right = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc624\ub978\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "right"], params:[{type:"Image", img:"/img/assets/week/blocks/turnR.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.test_wrapper = {skeleton:"basic", mode:"maze", color:"#3BBD70", template:"%1 this is test block %2", params:[{type:"Block", accept:"basic_boolean_field", value:[{type:"test", params:[30, 50]}]}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.basic_button = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"basic button", color:"#333", align:"center"}], func:function() {
}};
Entry.BlockMenu = function(b, a, d, c) {
  Entry.Model(this, !1);
  this._align = a || "CENTER";
  this.setAlign(this._align);
  this._scroll = void 0 !== c ? c : !1;
  this._bannedClass = [];
  this._categories = [];
  this.suffix = "blockMenu";
  this._isSelectingMenu = !1;
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = b;
  this.visible = !0;
  this._svgId = "blockMenu" + (new Date).getTime();
  this._clearCategory();
  this._categoryData = d;
  this._generateView(d);
  this._splitters = [];
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.pattern = Entry.Utils.addBlockPattern(this.svg, this.suffix).pattern;
  this.svgGroup = this.svg.elem("g");
  this.svgThreadGroup = this.svgGroup.elem("g");
  this.svgThreadGroup.board = this;
  this.svgBlockGroup = this.svgGroup.elem("g");
  this.svgBlockGroup.board = this;
  this.changeEvent = new Entry.Event(this);
  d && this._generateCategoryCodes(d);
  this.observe(this, "_handleDragBlock", ["dragBlock"]);
  this._scroll && (this._scroller = new Entry.BlockMenuScroller(this), this._addControl(b));
  Entry.documentMousedown && Entry.documentMousedown.attach(this, this.setSelectedBlock);
  this._categoryCodes && Entry.keyPressed && Entry.keyPressed.attach(this, this._captureKeyEvent);
  Entry.windowResized && (b = _.debounce(this.updateOffset, 200), Entry.windowResized.attach(this, b));
};
(function(b) {
  b.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  b._generateView = function(a) {
    var b = this.view, c = this;
    a && (this._categoryCol = Entry.Dom("ul", {class:"entryCategoryListWorkspace", parent:b}), this._generateCategoryView(a));
    this.blockMenuContainer = Entry.Dom("div", {"class":"blockMenuContainer", parent:b});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="blockMenu" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.blockMenuContainer});
    this.svgDom.mouseenter(function(a) {
      c._scroller && c._scroller.setOpacity(1);
      a = c.workspace.selectedBlockView;
      !Entry.playground || Entry.playground.resizing || a && a.dragMode === Entry.DRAG_MODE_DRAG || (Entry.playground.focusBlockMenu = !0, a = c.svgGroup.getBBox(), a = a.width + a.x + 64, a > Entry.interfaceState.menuWidth && (this.widthBackup = Entry.interfaceState.menuWidth - 64, $(this).stop().animate({width:a - 62}, 200)));
    });
    this.svgDom.mouseleave(function(a) {
      Entry.playground && !Entry.playground.resizing && (c._scroller && c._scroller.setOpacity(0), (a = this.widthBackup) && $(this).stop().animate({width:a}, 200), delete this.widthBackup, delete Entry.playground.focusBlockMenu);
    });
    $(window).scroll(function() {
      c.updateOffset();
    });
  };
  b.changeCode = function(a) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.codeListener && this.code.changeEvent.detach(this.codeListener);
    var b = this;
    this.set({code:a});
    this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    });
    a.createView(this);
    this.workspace.getMode();
    this.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD ? a.mode && "code" !== a.mode || this.renderText() : "text" === a.mode && this.renderBlock();
    this.align();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
    this._scroller && this.svgGroup.appendChild(this._scroller.svgGroup);
  };
  b.align = function(a) {
    var b = this.code;
    if (b) {
      this._clearSplitters();
      !b.view || a || this._isSelectingMenu || b.view.reDraw();
      a = b.getThreads();
      for (var b = 10, c = "LEFT" == this._align ? 10 : this.svgDom.width() / 2, e, f = 0, g = a.length;f < g;f++) {
        var h = a[f].getFirstBlock(), k = h.view, h = Entry.block[h.type];
        this.checkBanClass(h) ? k.set({display:!1}) : (k.set({display:!0}), h = h.class, e && e !== h && (this._createSplitter(b), b += 15), e = h, h = c - k.offsetX, "CENTER" == this._align && (h -= k.width / 2), b -= k.offsetY, k._moveTo(h, b, !1), b += k.height + 15);
      }
      this.updateSplitters();
      this.changeEvent.notify();
    }
  };
  b.cloneToGlobal = function(a) {
    if (!this._boardBlockView && null !== this.dragBlock) {
      var b = this.workspace, c = b.getMode(), e = this.dragBlock, f = this._svgWidth, g = b.selectedBoard;
      if (!g || c != Entry.Workspace.MODE_BOARD && c != Entry.Workspace.MODE_OVERLAYBOARD) {
        Entry.GlobalSvg.setView(e, b.getMode()) && Entry.GlobalSvg.addControl(a);
      } else {
        if (g.code && (b = e.block, c = b.getThread(), b && c)) {
          b = c.toJSON(!0);
          this._boardBlockView = Entry.do("addThread", b).value.getFirstBlock().view;
          var g = this.offset().top - g.offset().top - $(window).scrollTop(), h, k;
          if (b = this.dragBlock.mouseDownCoordinate) {
            h = a.pageX - b.x, k = a.pageY - b.y;
          }
          this._boardBlockView._moveTo(e.x - f + (h || 0), e.y + g + (k || 0), !1);
          this._boardBlockView.onMouseDown.call(this._boardBlockView, a);
          this._boardBlockView.dragInstance.set({isNew:!0});
        }
      }
    }
  };
  b.terminateDrag = function() {
    if (this._boardBlockView) {
      var a = this._boardBlockView;
      if (a) {
        this.workspace.getBoard();
        this._boardBlockView = null;
        var b = Entry.GlobalSvg.left, c = Entry.GlobalSvg.width / 2, a = a.getBoard().offset().left;
        return b < a - c;
      }
    }
  };
  b.getCode = function(a) {
    return this._code;
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.renderText = function(a) {
    var b = this.code.getThreads();
    this.code.mode = "text";
    for (var c = 0;c < b.length;c++) {
      b[c].view.renderText();
    }
    a && a();
  };
  b.renderBlock = function(a) {
    var b = this.code.getThreads();
    this.code.mode = "code";
    for (var c = 0;c < b.length;c++) {
      b[c].view.renderBlock();
    }
    a && a();
  };
  b._createSplitter = function(a) {
    a = this.svgBlockGroup.elem("line", {x1:20, y1:a, x2:this._svgWidth - 20, y2:a, stroke:"#b5b5b5"});
    this._splitters.push(a);
  };
  b.updateSplitters = function(a) {
    a = void 0 === a ? 0 : a;
    var b = this._svgWidth - 20, c;
    this._splitters.forEach(function(e) {
      c = parseFloat(e.getAttribute("y1")) + a;
      e.attr({x2:b, y1:c, y2:c});
    });
  };
  b._clearSplitters = function() {
    for (var a = this._splitters, b = a.length - 1;0 <= b;b--) {
      a[b].remove(), a.pop();
    }
  };
  b.setWidth = function() {
    this._svgWidth = this.blockMenuContainer.width();
    this.updateSplitters();
  };
  b.setMenu = function() {
    var a = this._categoryCodes, b = this._categoryElems, c;
    for (c in a) {
      for (var e = a[c], e = e instanceof Entry.Code ? e.getThreads() : e, f = e.length, g = 0;g < e.length;g++) {
        var h = e[g], h = h instanceof Entry.Thread ? h.getFirstBlock().type : h[0].type;
        this.checkBanClass(Entry.block[h]) && f--;
      }
      0 === f ? b[c].addClass("entryRemove") : b[c].removeClass("entryRemove");
    }
    this.selectMenu(0, !0);
  };
  b.getCategoryCodes = function(a) {
    a = this._convertSelector(a);
    var b = this._categoryCodes[a];
    b || (this._generateCategoryElement(a), b = []);
    b instanceof Entry.Code || (b = this._categoryCodes[a] = new Entry.Code(b));
    return b;
  };
  b._convertSelector = function(a) {
    if (isNaN(a)) {
      return a;
    }
    a = Number(a);
    for (var b = this._categories, c = this._categoryElems, e = 0;e < b.length;e++) {
      var f = b[e];
      if (!c[f].hasClass("entryRemove") && 0 === a--) {
        return f;
      }
    }
  };
  b.selectMenu = function(a, b) {
    var c = this._convertSelector(a);
    if (c) {
      this._isSelectingMenu = !0;
      switch(c) {
        case "variable":
          Entry.playground.checkVariables();
          break;
        case "arduino":
          this._generateHwCode();
      }
      var e = this._categoryElems[c], f = this._selectedCategoryView, g = !1, h = this.workspace.board, k = h.view;
      f && f.removeClass("entrySelectedCategory");
      e != f || b ? f || (this.visible || (g = !0, k.addClass("foldOut"), Entry.playground.showTabs()), k.removeClass("folding"), this.visible = !0) : (k.addClass("folding"), this._selectedCategoryView = null, e.removeClass("entrySelectedCategory"), Entry.playground.hideTabs(), g = !0, this.visible = !1);
      g && Entry.bindAnimationCallbackOnce(k, function() {
        h.scroller.resizeScrollBar.call(h.scroller);
        k.removeClass("foldOut");
        Entry.windowResized.notify();
      });
      this._isSelectingMenu = !1;
      this.visible && (f = this._categoryCodes[c], this._selectedCategoryView = e, e.addClass("entrySelectedCategory"), f.constructor !== Entry.Code && (f = this._categoryCodes[c] = new Entry.Code(f)), this.changeCode(f));
      this.lastSelector = c;
    } else {
      this.align();
    }
  };
  b._generateCategoryCodes = function(a) {
    this._categoryCodes = {};
    for (var b = 0;b < a.length;b++) {
      var c = a[b], e = [];
      c.blocks.forEach(function(a) {
        var b = Entry.block[a];
        if (b && b.def) {
          if (b.defs) {
            for (a = 0;a < b.defs.length;a++) {
              e.push([b.defs[a]]);
            }
          } else {
            e.push([b.def]);
          }
        } else {
          e.push([{type:a}]);
        }
      });
      c = c.category;
      this._categories.push(c);
      this._categoryCodes[c] = e;
    }
  };
  b.banClass = function(a, b) {
    0 > this._bannedClass.indexOf(a) && this._bannedClass.push(a);
    this.align(b);
  };
  b.unbanClass = function(a, b) {
    var c = this._bannedClass.indexOf(a);
    -1 < c && this._bannedClass.splice(c, 1);
    this.align(b);
  };
  b.checkBanClass = function(a) {
    if (a) {
      a = a.isNotFor;
      for (var b in this._bannedClass) {
        if (a && -1 < a.indexOf(this._bannedClass[b])) {
          return !0;
        }
      }
      return !1;
    }
  };
  b._addControl = function(a) {
    var b = this;
    a.on("wheel", function() {
      b._mouseWheel.apply(b, arguments);
    });
    b._scroller && $(this.svg).bind("mousedown touchstart", function(a) {
      b.onMouseDown.apply(b, arguments);
    });
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = Entry.Utils.convertMouseEvent(a);
      var c = e.dragInstance;
      e._scroller.scroll(-a.pageY + c.offsetY);
      c.set({offsetY:a.pageY});
    }
    function c(a) {
      $(document).unbind(".blockMenu");
      delete e.dragInstance;
    }
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    var e = this;
    if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
      a = Entry.Utils.convertMouseEvent(a);
      Entry.documentMousedown && Entry.documentMousedown.notify(a);
      var f = $(document);
      f.bind("mousemove.blockMenu", b);
      f.bind("mouseup.blockMenu", c);
      f.bind("touchmove.blockMenu", b);
      f.bind("touchend.blockMenu", c);
      this.dragInstance = new Entry.DragInstance({startY:a.pageY, offsetY:a.pageY});
    }
  };
  b._mouseWheel = function(a) {
    a = a.originalEvent;
    a.preventDefault();
    var b = Entry.disposeEvent;
    b && b.notify(a);
    this._scroller.scroll(-a.wheelDeltaY || a.deltaY / 3);
  };
  b.dominate = function(a) {
    this.svgBlockGroup.appendChild(a.view.svgGroup);
  };
  b.reDraw = function() {
    this.selectMenu(this.lastSelector, !0);
  };
  b._handleDragBlock = function() {
    this._boardBlockView = null;
    this._scroller && this._scroller.setOpacity(0);
  };
  b._captureKeyEvent = function(a) {
    var b = a.keyCode, c = Entry.type;
    a.ctrlKey && "workspace" == c && 48 < b && 58 > b && (a.preventDefault(), this.selectMenu(b - 49));
  };
  b.enablePattern = function() {
    this.pattern.removeAttribute("style");
  };
  b.disablePattern = function() {
    this.pattern.attr({style:"display: none"});
  };
  b._clearCategory = function() {
    this._selectedCategoryView = null;
    this._categories = [];
    var a = this._categoryElems, b;
    for (b in a) {
      a[b].remove();
    }
    this._categoryElems = {};
    a = this._categoryCodes;
    for (b in a) {
      var c = a[b];
      c.constructor == Entry.Code && c.clear();
    }
    this._categoryCodes = null;
  };
  b.setCategoryData = function(a) {
    this._clearCategory();
    this._categoryData = a;
    this._generateCategoryView(a);
    this._generateCategoryCodes(a);
    this.setMenu();
  };
  b._generateCategoryView = function(a) {
    if (a) {
      for (var b = 0;b < a.length;b++) {
        this._generateCategoryElement(a[b].category);
      }
    }
  };
  b._generateCategoryElement = function(a) {
    var b = this;
    (function(a, e) {
      a.text(Lang.Blocks[e.toUpperCase()]);
      b._categoryElems[e] = a;
      a.bindOnClick(function(a) {
        b.selectMenu(e);
      });
    })(Entry.Dom("li", {id:"entryCategory" + a, class:"entryCategoryElementWorkspace", parent:this._categoryCol}), a);
  };
  b.updateOffset = function() {
    this._offset = this.svgDom.offset();
  };
  b.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
  b._generateHwCode = function() {
    var a = this._categoryCodes.arduino;
    a instanceof Entry.Code && a.clear();
    for (var b = this._categoryData, c, a = b.length - 1;0 <= a;a--) {
      if ("arduino" === b[a].category) {
        c = b[a].blocks;
        break;
      }
    }
    b = [];
    for (a = 0;a < c.length;a++) {
      var e = c[a], f = Entry.block[e];
      if (!this.checkBanClass(f)) {
        if (f && f.def) {
          if (f.defs) {
            for (a = 0;a < f.defs.length;a++) {
              b.push([f.defs[a]]);
            }
          } else {
            b.push([f.def]);
          }
        } else {
          b.push([{type:e}]);
        }
      }
    }
    this._categoryCodes.arduino = b;
  };
  b.setAlign = function(a) {
    this._align = a || "CENTER";
  };
})(Entry.BlockMenu.prototype);
Entry.BlockMenuScroller = function(b) {
  var a = this;
  this.board = b;
  this.board.changeEvent.attach(this, this._reset);
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hX = 0;
  this._visible = !0;
  this._opacity = -1;
  this.mouseHandler = function() {
    a.onMouseDown.apply(a, arguments);
  };
  this.createScrollBar();
  this.setOpacity(0);
  this._addControl();
  this._domHeight = 0;
  Entry.windowResized && Entry.windowResized.attach(this, this.resizeScrollBar);
};
Entry.BlockMenuScroller.RADIUS = 7;
(function(b) {
  b.createScrollBar = function() {
    this.svgGroup = this.board.svgGroup.elem("g", {class:"boardScrollbar"});
    this.vScrollbar = this.svgGroup.elem("rect", {rx:4, ry:4});
    this.resizeScrollBar();
  };
  b.resizeScrollBar = function() {
    this._updateRatio();
    var a = this.board.blockMenuContainer, b = a.height();
    if (b !== this._domHeight) {
      return this._domHeight = b, this.board.align();
    }
    this._visible && 0 !== this.vRatio && this.vScrollbar.attr({width:9, height:a.height() / this.vRatio, x:a.width() - 9});
  };
  b.updateScrollBar = function(a) {
    this.vY += a;
    this.vScrollbar.attr({y:this.vY});
  };
  b.scroll = function(a) {
    this.isVisible() && (a = this._adjustValue(a) - this.vY, 0 !== a && (this.board.code.moveBy(0, -a * this.vRatio), this.updateScrollBar(a)));
  };
  b._adjustValue = function(a) {
    var b = this.board.svgDom.height(), b = b - b / this.vRatio;
    a = this.vY + a;
    a = Math.max(0, a);
    return a = Math.min(b, a);
  };
  b.setVisible = function(a) {
    a != this.isVisible() && (this._visible = a, this.svgGroup.attr({display:!0 === a ? "block" : "none"}));
  };
  b.setOpacity = function(a) {
    this._opacity != a && (this.vScrollbar.attr({opacity:a}), this._opacity = a);
  };
  b.isVisible = function() {
    return this._visible;
  };
  b._updateRatio = function() {
    var a = this.board, b = a.svgBlockGroup.getBoundingClientRect(), c = a.blockMenuContainer.height();
    a.offset();
    this.vRatio = a = (b.height + 20) / c;
    1 >= a ? this.setVisible(!1) : this.setVisible(!0);
  };
  b._reset = function() {
    this.vY = 0;
    this.vScrollbar.attr({y:this.vY});
    this.resizeScrollBar();
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var c = e.dragInstance;
      e.scroll(a.pageY - c.offsetY);
      c.set({offsetY:a.pageY});
    }
    function c(a) {
      $(document).unbind(".scroll");
      delete e.dragInstance;
    }
    var e = this;
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
      Entry.documentMousedown && Entry.documentMousedown.notify(a);
      var f;
      f = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var g = $(document);
      g.bind("mousemove.scroll", b);
      g.bind("mouseup.scroll", c);
      g.bind("touchmove.scroll", b);
      g.bind("touchend.scroll", c);
      e.dragInstance = new Entry.DragInstance({startY:f.pageY, offsetY:f.pageY});
    }
    a.stopPropagation();
  };
  b._addControl = function() {
    $(this.vScrollbar).bind("mousedown touchstart", this.mouseHandler);
  };
})(Entry.BlockMenuScroller.prototype);
Entry.BlockView = function(b, a, d) {
  var c = this;
  Entry.Model(this, !1);
  this.block = b;
  this._lazyUpdatePos = _.debounce(b._updatePos.bind(b), 200);
  this._board = a;
  this._observers = [];
  this.set(b);
  this.svgGroup = a.svgBlockGroup.elem("g");
  this._schema = Entry.skinContainer.getSkin(b);
  if (void 0 === this._schema) {
    this.block.destroy(!1, !1);
  } else {
    this._schema.deletable && this.block.setDeletable(this._schema.deletable);
    this._schema.copyable && this.block.setCopyable(this._schema.copyable);
    !1 === this._schema.display && this.set({display:!1});
    this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
    var e = this._skeleton = Entry.skeleton[this._schema.skeleton];
    this._contents = [];
    this._statements = [];
    this._extensions = [];
    this.magnet = {};
    this._paramMap = {};
    e.magnets && e.magnets(this).next && (this.svgGroup.nextMagnet = this.block, this._nextGroup = this.svgGroup.elem("g", {class:"entryBlockNextGroup"}), this._observers.push(this.observe(this, "_updateMagnet", ["contentHeight"])));
    this.isInBlockMenu = this.getBoard() instanceof Entry.BlockMenu;
    this.mouseHandler = function() {
      var a = c.block.events;
      a && a.mousedown && a.mousedown.forEach(function(a) {
        a(c);
      });
      c.onMouseDown.apply(c, arguments);
    };
    this._startRender(b, d);
    this._observers.push(this.block.observe(this, "_setMovable", ["movable"]));
    this._observers.push(this.block.observe(this, "_setReadOnly", ["movable"]));
    this._observers.push(this.block.observe(this, "_setCopyable", ["copyable"]));
    this._observers.push(this.block.observe(this, "_updateColor", ["deletable"], !1));
    this._observers.push(this.observe(this, "_updateBG", ["magneting"], !1));
    this._observers.push(this.observe(this, "_updateOpacity", ["visible"], !1));
    this._observers.push(this.observe(this, "_updateDisplay", ["display"], !1));
    this._observers.push(this.observe(this, "_updateShadow", ["shadow"]));
    this._observers.push(this.observe(this, "_updateMagnet", ["offsetY"]));
    this._observers.push(a.code.observe(this, "_setBoard", ["board"], !1));
    this.dragMode = Entry.DRAG_MODE_NONE;
    Entry.Utils.disableContextmenu(this.svgGroup.node);
    a = b.events.viewAdd;
    "workspace" == Entry.type && a && !this.isInBlockMenu && a.forEach(function(a) {
      Entry.Utils.isFunction(a) && a(b);
    });
  }
};
Entry.BlockView.PARAM_SPACE = 5;
Entry.BlockView.DRAG_RADIUS = 5;
Entry.BlockView.pngMap = {};
(function(b) {
  b.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, offsetX:0, offsetY:0, width:0, height:0, contentWidth:0, contentHeight:0, magneting:!1, visible:!0, animating:!1, shadow:!0, display:!0};
  b._startRender = function(a, b) {
    var c = this, e = this._skeleton;
    this.svgGroup.attr({class:"block"});
    this._schema.css && this.svgGroup.attr({style:this._schema.css});
    var f = e.classes;
    f && 0 !== f.length && f.forEach(function(a) {
      c.svgGroup.addClass(a);
    });
    f = e.path(this);
    this.pathGroup = this.svgGroup.elem("g");
    this._updateMagnet();
    this._path = this.pathGroup.elem("path");
    Entry.isMobile() || ($(this._path).mouseenter(function(a) {
      c._mouseEnable && c._changeFill(!0);
    }), $(this._path).mouseleave(function(a) {
      c._mouseEnable && c._changeFill(!1);
    }));
    var g = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (g = Entry.Utils.colorLighten(g));
    this._fillColor = g;
    f = {d:f, fill:g, class:"blockPath"};
    if (this.magnet.next || this._skeleton.nextShadow) {
      g = this.getBoard().suffix, this.pathGroup.attr({filter:"url(#entryBlockShadowFilter_" + g + ")"});
    } else {
      if (this.magnet.string || this.magnet.boolean) {
        f.stroke = e.outerLine;
      }
    }
    e.outerLine && (f["stroke-width"] = "0.6");
    this._path.attr(f);
    this._moveTo(this.x, this.y, !1);
    this._startContentRender(b);
    this._startExtension(b);
    !0 !== this._board.disableMouseEvent && this._addControl();
    (e = this.guideSvgGroup) && this.svgGroup.insertBefore(e, this.svgGroup.firstChild);
    this.bindPrev();
  };
  b._startContentRender = function(a) {
    a = void 0 === a ? Entry.Workspace.MODE_BOARD : a;
    var b = this._schema;
    this.contentSvgGroup && this.contentSvgGroup.remove();
    this.statementSvgGroup && this.statementSvgGroup.remove();
    this._contents = [];
    this.contentSvgGroup = this.svgGroup.elem("g", {class:"contentsGroup"});
    b.statements && b.statements.length && (this.statementSvgGroup = this.svgGroup.elem("g", {class:"statementGroup"}));
    switch(a) {
      case Entry.Workspace.MODE_BOARD:
      ;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        for (var c = /(%\d)/mi, e = (b.template ? b.template : Lang.template[this.block.type]).split(c), f = b.params, g = 0;g < e.length;g++) {
          var h = e[g];
          " " === h[0] && (h = h.substring(1));
          " " === h[h.length - 1] && (h = h.substring(0, h.length - 1));
          if (0 !== h.length) {
            if (c.test(h)) {
              var k = Number(h.split("%")[1]) - 1, h = f[k], h = new Entry["Field" + h.type](h, this, k, a, g);
              this._contents.push(h);
              this._paramMap[k] = h;
            } else {
              this._contents.push(new Entry.FieldText({text:h}, this));
            }
          }
        }
        if ((a = b.statements) && a.length) {
          for (g = 0;g < a.length;g++) {
            this._statements.push(new Entry.FieldStatement(a[g], this, g));
          }
        }
        break;
      case Entry.Workspace.MODE_VIMBOARD:
        if ("basic_button" === this._schema.skeleton) {
          this._startContentRender(Entry.Workspace.MODE_BOARD);
          return;
        }
        b = this.getBoard().workspace.getCodeToText(this.block);
        a = !1;
        /(if)+(.|\n)+(else)+/.test(b) && (g = b.split("\n"), b = g.shift() + " " + g.shift(), a = !0, g = g.join(" "));
        b = {text:b, color:"white"};
        this.block._schema.vimModeFontColor && (b.color = this.block._schema.vimModeFontColor);
        this._contents.push(new Entry.FieldText(b, this));
        a && (this._contents.push(new Entry.FieldLineBreak(null, this)), b.text = g, this._contents.push(new Entry.FieldText(b, this)));
    }
    this.alignContent(!1);
  };
  b._startExtension = function(a) {
    this._extensions = this.block.extensions.map(function(b) {
      return new Entry["Ext" + b.type](b, this, a);
    }.bind(this));
  };
  b._updateSchema = function() {
    this._startContentRender();
  };
  b.changeType = function(a) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this._schema = Entry.block[a];
    this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
    this._updateSchema();
  };
  b.alignContent = function(a) {
    !0 !== a && (a = !1);
    for (var b = 0, c = 0, e = 0, f = 0, g = 0, h = 0, k = 0;k < this._contents.length;k++) {
      var l = this._contents[k];
      l instanceof Entry.FieldLineBreak ? (this._alignStatement(a, f), l.align(f), f++, c = l.box.y, b = 8) : (l.align(b, c, a), k === this._contents.length - 1 || l instanceof Entry.FieldText && 0 == l._text.length || (b += Entry.BlockView.PARAM_SPACE));
      l = l.box;
      0 !== f ? h = Math.max(1E6 * Math.round(l.height), h) : e = Math.max(l.height, e);
      b += l.width;
      g = Math.max(g, b);
      this.set({contentWidth:g, contentHeight:e});
    }
    this.set({contentHeight:e + h});
    this._statements.length != f && this._alignStatement(a, f);
    a = this.getContentPos();
    this.contentSvgGroup.attr("transform", "translate(" + a.x + "," + a.y + ")");
    this.contentPos = a;
    this._render();
    this._updateMagnet();
  };
  b._alignStatement = function(a, b) {
    var c = this._skeleton.statementPos ? this._skeleton.statementPos(this) : [], e = this._statements[b];
    e && (c = c[b]) && e.align(c.x, c.y, a);
  };
  b._render = function() {
    this._renderPath();
    this.set(this._skeleton.box(this));
  };
  b._renderPath = function() {
    var a = this._skeleton.path(this);
    this._path.attr({d:a});
    this.set({animating:!1});
    this._setBackgroundPath();
  };
  b._setPosition = function(a) {
    this.svgGroup.attr("transform", "translate(" + this.x + "," + this.y + ")");
  };
  b._toLocalCoordinate = function(a) {
    this._moveTo(0, 0, !1);
    a.appendChild(this.svgGroup);
  };
  b._toGlobalCoordinate = function(a) {
    a = this.getAbsoluteCoordinate(a);
    this._moveTo(a.x, a.y, !1);
    this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
  };
  b._moveTo = function(a, b, c) {
    this.display ? this.set({x:a, y:b}) : this.set({x:-99999, y:-99999});
    this._lazyUpdatePos();
    this.visible && this.display && this._setPosition(c);
  };
  b._moveBy = function(a, b, c) {
    return this._moveTo(this.x + a, this.y + b, c);
  };
  b._addControl = function() {
    var a = this;
    this._mouseEnable = !0;
    $(this.svgGroup).bind("mousedown.blockViewMousedown touchstart.blockViewMousedown", a.mouseHandler);
    var b = a.block.events;
    b && b.dblclick && $(this.svgGroup).dblclick(function() {
      b.dblclick.forEach(function(b) {
        b && b(a);
      });
    });
  };
  b.removeControl = function() {
    this._mouseEnable = !1;
    $(this.svgGroup).unbind(".blockViewMousedown");
  };
  b.onMouseDown = function(a) {
    function d(a) {
      a.stopPropagation();
      var c = g.workspace.getMode(), d;
      c === Entry.Workspace.MODE_VIMBOARD && b.vimBoardEvent(a, "dragOver");
      d = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var h = f.mouseDownCoordinate, h = Math.sqrt(Math.pow(d.pageX - h.x, 2) + Math.pow(d.pageY - h.y, 2));
      if (f.dragMode == Entry.DRAG_MODE_DRAG || h > Entry.BlockView.DRAG_RADIUS) {
        e && (clearTimeout(e), e = null), f.movable && (f.isInBlockMenu ? g.cloneToGlobal(a) : (a = !1, f.dragMode != Entry.DRAG_MODE_DRAG && (f._toGlobalCoordinate(), f.dragMode = Entry.DRAG_MODE_DRAG, f.block.getThread().changeEvent.notify(), Entry.GlobalSvg.setView(f, c), a = !0), this.animating && this.set({animating:!1}), 0 === f.dragInstance.height && f.dragInstance.set({height:-1 + f.height}), c = f.dragInstance, f._moveBy(d.pageX - c.offsetX, d.pageY - c.offsetY, !1), c.set({offsetX:d.pageX, 
        offsetY:d.pageY}), Entry.GlobalSvg.position(), f.originPos || (f.originPos = {x:f.x, y:f.y}), a && g.generateCodeMagnetMap(), f._updateCloseBlock()));
      }
    }
    function c(a) {
      e && (clearTimeout(e), e = null);
      $(document).unbind(".block");
      f.terminateDrag(a);
      g && g.set({dragBlock:null});
      f._changeFill(!1);
      Entry.GlobalSvg.remove();
      delete this.mouseDownCoordinate;
      delete f.dragInstance;
    }
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    var e = null, f = this;
    this._changeFill(!1);
    var g = this.getBoard();
    Entry.documentMousedown && Entry.documentMousedown.notify(a);
    if (!this.readOnly && !g.viewOnly) {
      g.setSelectedBlock(this);
      this.dominate();
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        var h = a.type, k;
        k = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
        this.mouseDownCoordinate = {x:k.pageX, y:k.pageY};
        var l = $(document);
        l.bind("mousemove.block touchmove.block", d);
        l.bind("mouseup.block touchend.block", c);
        this.dragInstance = new Entry.DragInstance({startX:k.pageX, startY:k.pageY, offsetX:k.pageX, offsetY:k.pageY, height:0, mode:!0});
        g.set({dragBlock:this});
        this.addDragging();
        this.dragMode = Entry.DRAG_MODE_MOUSEDOWN;
        "touchstart" === h && (e = setTimeout(function() {
          e && (e = null, c(), f._rightClick(a));
        }, 1E3));
      } else {
        Entry.Utils.isRightButton(a) && this._rightClick(a);
      }
      g.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD && a && (vimBoard = $(".entryVimBoard>.CodeMirror")[0], document.getElementsByClassName("CodeMirror")[0].dispatchEvent(Entry.Utils.createMouseEvent("dragStart", event)));
    }
  };
  b.vimBoardEvent = function(a, b, c) {
    a && (a = Entry.Utils.createMouseEvent(b, a), c && (a.block = c), document.getElementsByClassName("CodeMirror")[0].dispatchEvent(a));
  };
  b.terminateDrag = function(a) {
    var b = this.getBoard(), c = this.dragMode, e = this.block, f = b.workspace.getMode();
    this.removeDragging();
    this.set({visible:!0});
    this.dragMode = Entry.DRAG_MODE_NONE;
    if (f === Entry.Workspace.MODE_VIMBOARD) {
      b instanceof Entry.BlockMenu ? (b.terminateDrag(), this.vimBoardEvent(a, "dragEnd", e)) : b.clear();
    } else {
      if (c === Entry.DRAG_MODE_DRAG) {
        var f = this.dragInstance && this.dragInstance.isNew, g = Entry.GlobalSvg;
        a = !1;
        var h = this.block.getPrevBlock(this.block);
        switch(g.terminateDrag(this)) {
          case g.DONE:
            g = b.magnetedBlockView;
            g instanceof Entry.BlockView && (g = g.block);
            h && !g ? Entry.do("separateBlock", e) : h || g || f ? g ? ("next" === g.view.magneting ? (h = e.getLastBlock(), this.dragMode = c, b.separate(e), this.dragMode = Entry.DRAG_MODE_NONE, Entry.do("insertBlock", g, h).isPass(f), Entry.ConnectionRipple.setView(g.view).dispose()) : (Entry.do("insertBlock", e, g).isPass(f), a = !0), createjs.Sound.play("entryMagneting")) : Entry.do("moveBlock", e).isPass(f) : e.getThread().view.isGlobal() ? Entry.do("moveBlock", e) : Entry.do("separateBlock", 
            e);
            break;
          case g.RETURN:
            e = this.block;
            c = this.originPos;
            h ? (this.set({animating:!1}), createjs.Sound.play("entryMagneting"), this.bindPrev(h), e.insert(h)) : (f = e.getThread().view.getParent(), f instanceof Entry.Board ? this._moveTo(c.x, c.y, !1) : (createjs.Sound.play("entryMagneting"), Entry.do("insertBlock", e, f)));
            break;
          case g.REMOVE:
            createjs.Sound.play("entryDelete"), f ? this.block.destroy(!1, !0) : this.block.doDestroyBelow(!1);
        }
        b.setMagnetedBlock(null);
        a && Entry.ConnectionRipple.setView(e.view).dispose();
      }
    }
    this.destroyShadow();
    delete this.originPos;
    this.dominate();
  };
  b._updateCloseBlock = function() {
    var a = this.getBoard(), b;
    if (this._skeleton.magnets) {
      for (var c in this.magnet) {
        if (b = "next" === c ? this.getBoard().getNearestMagnet(this.x, this.y + this.getBelowHeight(), c) : this.getBoard().getNearestMagnet(this.x, this.y, c)) {
          return a.setMagnetedBlock(b.view, c);
        }
      }
      a.setMagnetedBlock(null);
    }
  };
  b.dominate = function() {
    this.block.getThread().view.dominate();
  };
  b.getSvgRoot = function() {
    for (var a = this.getBoard().svgBlockGroup, b = this.svgGroup;b.parentNode !== a;) {
      b = b.parentNode;
    }
    return b;
  };
  b.getBoard = function() {
    return this._board;
  };
  b._setBoard = function() {
    this._board = this._board.code.board;
  };
  b.destroy = function(a) {
    $(this.svgGroup).unbind(".blockViewMousedown");
    this._destroyObservers();
    var b = this.svgGroup;
    a ? $(b).fadeOut(100, function() {
      b.remove();
    }) : b.remove();
    this._contents.forEach(function(a) {
      a.constructor !== Entry.Block && a.destroy();
    });
    this._statements.forEach(function(a) {
      a.destroy();
    });
    var c = this.block;
    a = c.events.viewDestroy;
    "workspace" == Entry.type && a && !this.isInBlockMenu && a.forEach(function(a) {
      Entry.Utils.isFunction(a) && a(c);
    });
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
  };
  b.getShadow = function() {
    this._shadow || (this._shadow = Entry.SVG.createElement(this.svgGroup.cloneNode(!0), {opacity:.5}), this.getBoard().svgGroup.appendChild(this._shadow));
    return this._shadow;
  };
  b.destroyShadow = function() {
    this._shadow && (this._shadow.remove(), delete this._shadow);
  };
  b._updateMagnet = function() {
    if (this._skeleton.magnets) {
      var a = this._skeleton.magnets(this);
      a.next && this._nextGroup.attr("transform", "translate(" + a.next.x + "," + a.next.y + ")");
      this.magnet = a;
      this.block.getThread().changeEvent.notify();
    }
  };
  b._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      var a = this.svgGroup;
      if (this.magnet.next || this.magnet.previous) {
        if (a = this.magneting) {
          var b = this._board.dragBlock.getShadow(), c = this.getAbsoluteCoordinate(), e;
          if ("previous" === a) {
            e = this.magnet.next, e = "translate(" + (c.x + e.x) + "," + (c.y + e.y) + ")";
          } else {
            if ("next" === a) {
              e = this.magnet.previous;
              var f = this._board.dragBlock.getBelowHeight();
              e = "translate(" + (c.x + e.x) + "," + (c.y + e.y - f) + ")";
            }
          }
          $(b).attr({transform:e, display:"block"});
          this._clonedShadow = b;
          this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
          "previous" === a && (a = this._board.dragBlock.getBelowHeight() + this.offsetY, this.originalHeight = this.offsetY, this.set({offsetY:a}));
        } else {
          this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), this.set({offsetY:a}), delete this.originalHeight);
        }
        (a = this.block.thread.changeEvent) && a.notify();
      } else {
        this.magneting ? (a.attr({filter:"url(#entryBlockHighlightFilter_" + this.getBoard().suffix + ")"}), a.addClass("outputHighlight")) : (a.removeClass("outputHighlight"), a.removeAttr("filter"));
      }
    }
  };
  b.addDragging = function() {
    this.svgGroup.addClass("dragging");
  };
  b.removeDragging = function() {
    this.svgGroup.removeClass("dragging");
  };
  b.addSelected = function() {
    this.svgGroup.addClass("selected");
  };
  b.removeSelected = function() {
    this.svgGroup.removeClass("selected");
  };
  b.getSkeleton = function() {
    return this._skeleton;
  };
  b.getContentPos = function() {
    return this._skeleton.contentPos(this);
  };
  b.renderText = function() {
    this._startContentRender(Entry.Workspace.MODE_VIMBOARD);
  };
  b.renderBlock = function() {
    this._startContentRender(Entry.Workspace.MODE_BOARD);
  };
  b._updateOpacity = function() {
    this.svgGroup.attr({opacity:!1 === this.visible ? 0 : 1});
    this.visible && this._setPosition();
  };
  b._updateShadow = function() {
    this.shadow && Entry.Utils.colorDarken(this._schema.color, .7);
  };
  b._setMovable = function() {
    this.movable = null !== this.block.isMovable() ? this.block.isMovable() : void 0 !== this._skeleton.movable ? this._skeleton.movable : !0;
  };
  b._setReadOnly = function() {
    this.readOnly = null !== this.block.isReadOnly() ? this.block.isReadOnly() : void 0 !== this._skeleton.readOnly ? this._skeleton.readOnly : !1;
  };
  b._setCopyable = function() {
    this.copyable = null !== this.block.isCopyable() ? this.block.isCopyable() : void 0 !== this._skeleton.copyable ? this._skeleton.copyable : !0;
  };
  b.bumpAway = function(a, b) {
    var c = this;
    a = a || 15;
    b ? window.setTimeout(function() {
      c._moveBy(a, a, !1);
    }, b) : c._moveBy(a, a, !1);
  };
  b.bindPrev = function(a, b) {
    if (a) {
      this._toLocalCoordinate(a.view._nextGroup);
      var c = a.getNextBlock();
      if (c && c && c !== this.block) {
        var e = this.block.getLastBlock();
        b ? c.view._toLocalCoordinate(a.view._nextGroup) : e.view.magnet.next ? c.view._toLocalCoordinate(e.view._nextGroup) : (c.view._toGlobalCoordinate(), c.separate(), c.view.bumpAway(null, 100));
      }
    } else {
      if (a = this.block.getPrevBlock()) {
        this._toLocalCoordinate(a.view._nextGroup), (c = this.block.getNextBlock()) && c.view && c.view._toLocalCoordinate(this._nextGroup);
      }
    }
  };
  b.getAbsoluteCoordinate = function(a) {
    a = void 0 !== a ? a : this.dragMode;
    if (a === Entry.DRAG_MODE_DRAG) {
      return {x:this.x, y:this.y};
    }
    a = this.block.getThread().view.requestAbsoluteCoordinate(this);
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  b.getBelowHeight = function() {
    return this.block.getThread().view.requestPartHeight(this);
  };
  b._updateDisplay = function() {
    this.svgGroup.attr({display:!1 === this.display ? "none" : "block"});
    this.display && this._setPosition();
  };
  b._updateColor = function() {
    var a = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (a = Entry.Utils.colorLighten(a));
    this._fillColor = a;
    this._path.attr({fill:a});
    this._updateContents();
  };
  b._updateContents = function() {
    this._contents.forEach(function(a) {
      a.renderStart();
    }.bind(this));
    this.alignContent(!1);
  };
  b._destroyObservers = function() {
    for (var a = this._observers;a.length;) {
      a.pop().destroy();
    }
  };
  b._changeFill = function(a) {
    var b = this.getBoard();
    if (!b.dragBlock) {
      var c = this._fillColor, e = this._path, b = this.getBoard();
      a ? (c = "url(#blockHoverPattern_" + this.getBoard().suffix + ")", b.enablePattern()) : b.disablePattern();
      e.attr({fill:c});
    }
  };
  b.addActivated = function() {
    this.svgGroup.addClass("activated");
  };
  b.removeActivated = function() {
    this.svgGroup.removeClass("activated");
  };
  b.reDraw = function() {
    if (this.visible && this.display) {
      var a = this.block;
      this._updateContents();
      var b = a.statements;
      if (b) {
        for (a = 0;a < b.length;a++) {
          b[a].view.reDraw();
        }
      }
      if (b = this._extensions) {
        for (a = 0;a < b.length;a++) {
          var c = b[a];
          c.updatePos && c.updatePos();
        }
      }
    }
  };
  b.getParam = function(a) {
    return this._paramMap[a];
  };
  b.getDataUrl = function(a, b) {
    function c() {
      g = g.replace("(svgGroup)", (new XMLSerializer).serializeToString(k)).replace("%W", h.width * m).replace("%H", h.height * m).replace("(defs)", (new XMLSerializer).serializeToString(q[0])).replace(/>\s+/g, ">").replace(/\s+</g, "<");
      var a = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(g)));
      g = null;
      b ? (f.resolve({src:a, width:h.width, height:h.height}), k = null) : e(a, h.width, h.height, 1.5).then(function(a) {
        k = null;
        f.resolve({src:a, width:h.width, height:h.height});
      }, function(a) {
        f.reject("error occured");
      });
      a = null;
    }
    function e(a, b, c, d) {
      var e = $.Deferred();
      d || (d = 1);
      void 0 !== Entry.BlockView.pngMap[a] && e.resolve(Entry.BlockView.pngMap[a]);
      b *= d;
      c *= d;
      b = Math.ceil(b);
      c = Math.ceil(c);
      var f = document.createElement("img");
      f.crossOrigin = "Anonymous";
      var g = document.createElement("canvas");
      g.width = b;
      g.height = c;
      var h = g.getContext("2d");
      f.onload = function() {
        h.drawImage(f, 0, 0, b, c);
        var d = g.toDataURL("image/png");
        /\.png$/.test(a) && (Entry.BlockView.pngMap[a] = d);
        e.resolve(d);
      };
      f.onerror = function() {
        e.reject("error occured");
      };
      f.src = a;
      return e.promise();
    }
    var f = $.Deferred(), g = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %W %H">(svgGroup)(defs)</svg>', h = this.svgGroup.getBoundingClientRect(), k = a ? this.svgGroup : this.svgGroup.cloneNode(!0), l = this._skeleton.box(this), m = b ? 1 : 1.5, n = function() {
      var a = window.platform;
      return a && "windows" === a.name.toLowerCase() && "7" === a.version[0] ? !0 : !1;
    }() ? .9 : .95;
    -1 < this.type.indexOf("func_") && (n *= .99);
    k.setAttribute("transform", "scale(%SCALE) translate(%X,%Y)".replace("%X", -l.offsetX).replace("%Y", -l.offsetY).replace("%SCALE", m));
    for (var q = this.getBoard().svgDom.find("defs"), r = k.getElementsByTagName("image"), l = k.getElementsByTagName("text"), t = ["\u2265", "\u2264"], u = "\u2265\u2264-><=+-x/".split(""), v = 0;v < l.length;v++) {
      (function(a) {
        a.setAttribute("font-family", "'nanumBarunRegular', 'NanumGothic', '\ub098\ub214\uace0\ub515','NanumGothicWeb', '\ub9d1\uc740 \uace0\ub515', 'Malgun Gothic', Dotum");
        var b = parseInt(a.getAttribute("font-size")), c = $(a).text();
        -1 < t.indexOf(c) && a.setAttribute("font-weight", "500");
        if ("q" == c) {
          var d = parseInt(a.getAttribute("y"));
          a.setAttribute("y", d - 1);
        }
        -1 < u.indexOf(c) ? a.setAttribute("font-size", b + "px") : a.setAttribute("font-size", b * n + "px");
        a.setAttribute("alignment-baseline", "baseline");
      })(l[v]);
    }
    var x = 0;
    if (0 === r.length) {
      c();
    } else {
      for (v = 0;v < r.length;v++) {
        (function(a) {
          var b = a.getAttribute("href");
          e(b, a.getAttribute("width"), a.getAttribute("height")).then(function(b) {
            a.setAttribute("href", b);
            if (++x == r.length) {
              return c();
            }
          });
        })(r[v]);
      }
    }
    return f.promise();
  };
  b.downloadAsImage = function(a) {
    this.getDataUrl().then(function(b) {
      var c = document.createElement("a");
      c.href = b.src;
      b = "\uc5d4\ud2b8\ub9ac \ube14\ub85d";
      a && (b += a);
      c.download = b + ".png";
      c.click();
    });
  };
  b._rightClick = function(a) {
    var b = Entry.disposeEvent;
    b && b.notify(a);
    var c = this, e = c.block;
    if (!this.isInBlockMenu) {
      var b = [], f = {text:Lang.Blocks.Duplication_option, enable:this.copyable, callback:function() {
        Entry.do("cloneBlock", e);
      }}, g = {text:Lang.Blocks.CONTEXT_COPY_option, enable:this.copyable, callback:function() {
        c.block.copyToClipboard();
      }}, h = {text:Lang.Blocks.Delete_Blocks, enable:e.isDeletable(), callback:function() {
        Entry.do("destroyBlock", c.block);
      }}, k = {text:Lang.Menus.save_as_image, callback:function() {
        c.downloadAsImage();
      }};
      b.push(f);
      b.push(g);
      b.push(h);
      Entry.Utils.isChrome() && "workspace" == Entry.type && !Entry.isMobile() && b.push(k);
      a.originalEvent && a.originalEvent.touches && (a = a.originalEvent.touches[0]);
      Entry.ContextMenu.show(b, null, {x:a.clientX, y:a.clientY});
    }
  };
  b.clone = function() {
    return this.svgGroup.cloneNode(!0);
  };
  b._setBackgroundPath = function() {
    this._backgroundPath && $(this._backgroundPath).remove();
    var a = this._path.cloneNode(!0);
    a.setAttribute("class", "blockBackgroundPath");
    a.setAttribute("fill", this._fillColor);
    this._backgroundPath = a;
    this.pathGroup.insertBefore(a, this._path);
  };
})(Entry.BlockView.prototype);
Entry.Code = function(b, a) {
  Entry.Model(this, !1);
  a && (this.object = a);
  this._data = new Entry.Collection;
  this._eventMap = {};
  this._blockMap = {};
  this.executors = [];
  this.watchEvent = new Entry.Event(this);
  this.executeEndEvent = new Entry.Event(this);
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this._handleChange);
  this._maxZIndex = 0;
  this.load(b);
};
Entry.STATEMENT = 0;
Entry.PARAM = -1;
(function(b) {
  b.schema = {view:null, board:null};
  b.load = function(a) {
    a instanceof Array || (a = JSON.parse(a));
    this.clear();
    for (var b = 0;b < a.length;b++) {
      this._data.push(new Entry.Thread(a[b], this));
    }
    return this;
  };
  b.clear = function(a) {
    a = void 0 === a ? !1 : a;
    for (var b = this._data.length - 1;0 <= b;b--) {
      this._data[b].destroy(!1, a);
    }
    this.clearExecutors();
  };
  b.createView = function(a) {
    null === this.view ? this.set({view:new Entry.CodeView(this, a), board:a}) : (this.set({board:a}), a.bindCodeView(this.view));
  };
  b.destroyView = function() {
    this.view && (this.view.destroy(), delete this.view);
  };
  b.recreateView = function() {
    this.view && (this.destroyView(), this.set({view:new Entry.CodeView(this, this.board), board:this.board}));
  };
  b.registerEvent = function(a, b) {
    this._eventMap[b] || (this._eventMap[b] = []);
    this._eventMap[b].push(a);
  };
  b.unregisterEvent = function(a, b) {
    var c = this._eventMap[b];
    if (c && 0 !== c.length) {
      var e = c.indexOf(a);
      0 > e || c.splice(e, 1);
    }
  };
  b.raiseEvent = function(a, b, c) {
    a = this._eventMap[a];
    var e = [];
    if (void 0 !== a) {
      for (var f = 0;f < a.length;f++) {
        var g = a[f];
        if (void 0 === c || -1 < g.params.indexOf(c)) {
          g = new Entry.Executor(a[f], b), this.executors.push(g), e.push(g);
        }
      }
      return e;
    }
  };
  b.getEventMap = function(a) {
    return this._eventMap[a];
  };
  b.map = function(a) {
    this._data.map(a);
  };
  b.tick = function() {
    for (var a = this.executors, b = [], c = 0;c < a.length;c++) {
      var e = a[c];
      e.isEnd() ? (a.splice(c--, 1), 0 === a.length && this.executeEndEvent.notify()) : b = b.concat(e.execute());
    }
    this.watchEvent.notify(b);
  };
  b.removeExecutor = function(a) {
    a = this.executors.indexOf(a);
    -1 < a && this.executors.splice(a, 1);
  };
  b.clearExecutors = function() {
    this.executors.forEach(function(a) {
      a.end();
    });
    this.executors = [];
  };
  b.clearExecutorsByEntity = function(a) {
    for (var b = this.executors, c = 0;c < b.length;c++) {
      var e = b[c];
      e.entity === a && e.end();
    }
  };
  b.addExecutor = function(a) {
    this.executors.push(a);
  };
  b.createThread = function(a, b) {
    if (!(a instanceof Array)) {
      return console.error("blocks must be array");
    }
    var c = new Entry.Thread(a, this);
    void 0 === b ? this._data.push(c) : this._data.insert(c, b);
    this.changeEvent.notify();
    return c;
  };
  b.cloneThread = function(a, b) {
    var c = a.clone(this, b);
    this._data.push(c);
    return c;
  };
  b.destroyThread = function(a, b) {
    var c = this._data, e = c.indexOf(a);
    0 > e || c.splice(e, 1);
  };
  b.doDestroyThread = function(a, b) {
    var c = this._data, e = c.indexOf(a);
    0 > e || c.splice(e, 1);
  };
  b.getThreads = function() {
    return this._data.map(function(a) {
      return a;
    });
  };
  b.toJSON = function(a) {
    for (var b = this.getThreads(), c = [], e = 0, f = b.length;e < f;e++) {
      c.push(b[e].toJSON(!1, void 0, a));
    }
    return c;
  };
  b.countBlock = function() {
    for (var a = this.getThreads(), b = 0, c = 0;c < a.length;c++) {
      b += a[c].countBlock();
    }
    return b;
  };
  b.moveBy = function(a, b) {
    for (var c = this.getThreads(), e = 0, f = c.length;e < f;e++) {
      var g = c[e].getFirstBlock();
      g && g.view._moveBy(a, b, !1);
    }
    c = this.board;
    c instanceof Entry.BlockMenu && c.updateSplitters(b);
  };
  b.stringify = function(a) {
    return JSON.stringify(this.toJSON(a));
  };
  b.dominate = function(a) {
    a.view.setZIndex(this._maxZIndex++);
  };
  b.indexOf = function(a) {
    return this._data.indexOf(a);
  };
  b._handleChange = function() {
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  };
  b.hasBlockType = function(a) {
    for (var b = this.getThreads(), c = 0;c < b.length;c++) {
      if (b[c].hasBlockType(a)) {
        return !0;
      }
    }
    return !1;
  };
  b.findById = function(a) {
    return this._blockMap[a];
  };
  b.registerBlock = function(a) {
    this._blockMap[a.id] = a;
  };
  b.unregisterBlock = function(a) {
    delete this._blockMap[a.id];
  };
  b.getByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    for (var b = this._data[a.shift()].getBlock(a.shift());a.length;) {
      b instanceof Entry.Block || (b = b.getValueBlock());
      var c = a.shift(), e = a.shift();
      -1 < c ? b = b.statements[c].getBlock(e) : -1 === c && (b = b.view.getParam(e));
    }
    return b;
  };
  b.getTargetByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    var b = this._data[a.shift()], c;
    if (1 === a.length) {
      c = b.getBlock(a.shift() - 1);
    } else {
      for (c = b.getBlock(a.shift());a.length;) {
        c instanceof Entry.Block || (c = c.getValueBlock());
        var e = a.shift(), b = a.shift();
        -1 < e ? (c = c.statements[e], c = a.length ? c.getBlock(b) : 0 === b ? c.view.getParent() : c.getBlock(b - 1)) : -1 === e && (c = c.view.getParam(b));
      }
    }
    return c;
  };
  b.getBlockList = function(a, b) {
    for (var c = this.getThreads(), e = [], f = 0;f < c.length;f++) {
      e = e.concat(c[f].getBlockList(a, b));
    }
    return e;
  };
  b.removeBlocksByType = function(a) {
    this.getBlockList(!1, a).forEach(function(a) {
      a.doDestroy();
    });
  };
})(Entry.Code.prototype);
Entry.CodeView = function(b, a) {
  Entry.Model(this, !1);
  this.code = b;
  this.set({board:a});
  this.svgThreadGroup = a.svgGroup.elem("g");
  this.svgThreadGroup.attr({class:"svgThreadGroup"});
  this.svgThreadGroup.board = a;
  this.svgBlockGroup = a.svgGroup.elem("g");
  this.svgBlockGroup.attr({class:"svgBlockGroup"});
  this.svgBlockGroup.board = a;
  a.bindCodeView(this);
  this.code._data.getAll().forEach(function(b) {
    b.createView(a);
  });
  b.observe(this, "_setBoard", ["board"]);
};
(function(b) {
  b.schema = {board:null, scrollX:0, scrollY:0};
  b._setBoard = function() {
    this.set({board:this.code.board});
  };
  b.reDraw = function() {
    this.code.map(function(a) {
      a.view.reDraw();
    });
  };
  b.destroy = function() {
    this.code.map(function(a) {
      a.destroyView();
    });
  };
})(Entry.CodeView.prototype);
Entry.ConnectionRipple = {};
(function(b) {
  b.createDom = function(a) {
    this.svgDom || (this._ripple = a.getBoard().svgGroup.elem("circle", {cx:0, cy:0, r:0, stroke:"#888", "stroke-width":10}));
  };
  b.setView = function(a) {
    this._ripple || this.createDom(a);
    var b = this._ripple, c = a.getBoard().svgGroup;
    b.remove();
    a = a.getAbsoluteCoordinate();
    b.attr({cx:a.x, cy:a.y});
    c.appendChild(b);
    b._startTime = new Date;
    return this;
  };
  b.dispose = function() {
    var a = this, b = this._ripple, c = (new Date - b._startTime) / 150;
    1 < c ? b.remove() : (b.attr({r:25 * c, opacity:1 - c}), window.setTimeout(function() {
      a.dispose();
    }, 10));
  };
})(Entry.ConnectionRipple);
Entry.Executor = function(b, a) {
  this.scope = new Entry.Scope(b, this);
  this.entity = a;
  this._callStack = [];
  this.register = {};
};
(function(b) {
  b.execute = function() {
    if (!this.isEnd()) {
      for (var a = [];;) {
        var b = null;
        a.push(this.scope.block);
        try {
          var c = this.scope.block.getSchema();
          c && (b = c.func.call(this.scope, this.entity, this.scope));
        } catch (f) {
          if ("AsyncError" === f.name) {
            b = Entry.STATIC.BREAK;
          } else {
            var e = !1;
            "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec" != f.message && (e = !0);
            Entry.Utils.stopProjectWithToast(this.scope, "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec", e);
          }
        }
        if (this.isEnd()) {
          break;
        }
        if (void 0 === b || null === b || b === Entry.STATIC.PASS) {
          if (this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this), null === this.scope.block) {
            if (this._callStack.length) {
              if (b = this.scope, this.scope = this._callStack.pop(), this.scope.isLooped !== b.isLooped) {
                break;
              }
            } else {
              break;
            }
          }
        } else {
          if (b !== Entry.STATIC.CONTINUE && (b === Entry.STATIC.BREAK || this.scope === b)) {
            break;
          }
        }
      }
      return a;
    }
  };
  b.stepInto = function(a) {
    a instanceof Entry.Thread || console.error("Must step in to thread");
    a = a.getFirstBlock();
    if (!a) {
      return Entry.STATIC.BREAK;
    }
    this._callStack.push(this.scope);
    this.scope = new Entry.Scope(a, this);
    return Entry.STATIC.CONTINUE;
  };
  b.break = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    return Entry.STATIC.PASS;
  };
  b.breakLoop = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    for (;this._callStack.length && "repeat" !== Entry.block[this.scope.block.type].class;) {
      this.scope = this._callStack.pop();
    }
    return Entry.STATIC.PASS;
  };
  b.end = function() {
    this.scope.block = null;
  };
  b.isEnd = function() {
    return null === this.scope.block;
  };
})(Entry.Executor.prototype);
Entry.Scope = function(b, a) {
  this.type = (this.block = b) ? b.type : null;
  this.executor = a;
  this.entity = a.entity;
};
(function(b) {
  b.callReturn = function() {
  };
  b.getParam = function(a) {
    a = this.block.params[a];
    var b = new Entry.Scope(a, this.executor);
    return Entry.block[a.type].func.call(b, this.entity, b);
  };
  b.getParams = function() {
    var a = this;
    return this.block.params.map(function(b) {
      if (b instanceof Entry.Block) {
        var c = new Entry.Scope(b, a.executor);
        return Entry.block[b.type].func.call(c, a.entity, c);
      }
      return b;
    });
  };
  b.getValue = function(a, b) {
    var c = this.block.params[this._getParamIndex(a, b)], e = new Entry.Scope(c, this.executor);
    return Entry.block[c.type].func.call(e, this.entity, e);
  };
  b.getStringValue = function(a, b) {
    return String(this.getValue(a, b));
  };
  b.getNumberValue = function(a, b) {
    return Number(this.getValue(a));
  };
  b.getBooleanValue = function(a, b) {
    return Number(this.getValue(a, b)) ? !0 : !1;
  };
  b.getField = function(a, b) {
    return this.block.params[this._getParamIndex(a)];
  };
  b.getStringField = function(a, b) {
    return String(this.getField(a));
  };
  b.getNumberField = function(a) {
    return Number(this.getField(a));
  };
  b.getStatement = function(a, b) {
    return this.executor.stepInto(this.block.statements[this._getStatementIndex(a, b)]);
  };
  b._getParamIndex = function(a) {
    this._schema || (this._schema = Entry.block[this.type]);
    return this._schema.paramsKeyMap[a];
  };
  b._getStatementIndex = function(a) {
    this._schema || (this._schema = Entry.block[this.type]);
    return this._schema.statementsKeyMap[a];
  };
  b.die = function() {
    this.block = null;
    return Entry.STATIC.BREAK;
  };
})(Entry.Scope.prototype);
Entry.BlockExtension = function(b, a) {
};
(function(b) {
})(Entry.BlockExtension.prototype);
Entry.ExtGuide = function(b, a, d) {
  this.blockView = a;
  this.block = a.block;
  this.model = b.model ? b.model : [];
  this.render();
};
(function(b) {
  b.render = function() {
    if (this.model) {
      var a = this.blockView.getBoard();
      this.svgGroup = this.blockView.svgGroup.elem("g", {class:"extension guideGroup"});
      this.blockView.guideSvgGroup = this.svgGroup;
      $(this.svgGroup).bind("mousedown touchstart", function(a) {
        a.stopPropagation && a.stopPropagation();
        a.preventDefault && a.preventDefault();
      });
      var b = this.block.getCode();
      this.model[0].x = -99999;
      this.model[0].y = -99999;
      b = b.createThread(this.model);
      !b.view && b.createView(a);
      a = b.getFirstBlock().view.clone();
      a.removeAttribute("transform");
      this.svgGroup.appendChild(a);
      this.updatePos();
      this.block.getThread().view.setHasGuide(!0);
      b.destroy(!1);
    }
  };
  b.updatePos = function() {
    this.svgGroup.attr("transform", this._getTransform());
  };
  b._getTransform = function() {
    return "translate(0,%y)".replace("%y", this.blockView.magnet.next.y);
  };
})(Entry.ExtGuide.prototype);
Entry.ExtSideTag = function(b, a, d) {
  this.blockView = a;
  this.color = b.color ? b.color : "#EBC576";
  this.text = b.text ? b.text : "";
  this.height = b.height ? Number(b.height) : 31 * Number(b.count);
  this.render();
  this.updatePos();
};
(function(b) {
  b.render = function() {
    this.svgGroup = this.blockView.svgGroup.elem("g");
    $(this.svgGroup).bind("mousedown touchstart", function(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
    });
    this.path = this.svgGroup.elem("path").attr({d:"m0,2 h-9 v" + (this.height - 4) + " h9", stroke:this.color, fill:"transparent", "stroke-width":"3"});
    this.textElement = this.svgGroup.elem("text").attr({style:"white-space: pre;", "font-size":"10px", "font-family":"nanumBarunRegular", "class":"dragNone", fill:"#000000"});
    this.tspans = this.text.split("\n").map(function(a) {
      var b = this.textElement.elem("tspan").attr({dy:"1.2em", x:"0", "class":"extension sideTagTspan"});
      b.textContent = a;
      return b;
    }.bind(this));
  };
  b.updatePos = function() {
    this.positionX = 8 * -(this.blockView.block.pointer().length - 2);
    this.svgGroup.attr("transform", "translate(" + this.positionX + ",0)");
    this.textElement.attr({y:this.height / 2 - 12 * (this.tspans.length - 1) - 2});
    var a = this.textElement.getBoundingClientRect();
    this.tspans.map(function(b) {
      b.attr({x:-a.width - 14});
    });
  };
})(Entry.ExtSideTag.prototype);
Entry.Field = function() {
};
(function(b) {
  b.TEXT_LIMIT_LENGTH = 20;
  b.destroy = function() {
    $(this.svgGroup).unbind("mouseup touchend");
    this.destroyOption();
  };
  b.command = function() {
    this._startValue && (this._startValue === this.getValue() || this._blockView.isInBlockMenu || Entry.do("setFieldValue", this._block, this, this.pointer(), this._startValue, this.getValue()));
    delete this._startValue;
  };
  b.destroyOption = function() {
    this.documentDownEvent && (Entry.documentMousedown.detach(this.documentDownEvent), delete this.documentDownEvent);
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    if (this.optionGroup) {
      var a = this.optionGroup.blur;
      a && Entry.Utils.isFunction(a) && this.optionGroup.blur();
      this.optionGroup.remove();
      delete this.optionGroup;
    }
    this.command();
  };
  b._attachDisposeEvent = function(a) {
    var b = this;
    b.disposeEvent = Entry.disposeEvent.attach(b, a || function() {
      b.destroyOption();
    });
  };
  b.align = function(a, b, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = "translate(" + a + "," + b + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.getAbsolutePosFromBoard = function() {
    var a = this._block.view, b = a.getContentPos(), a = a.getAbsoluteCoordinate();
    return {x:a.x + this.box.x + b.x, y:a.y + this.box.y + b.y};
  };
  b.getAbsolutePosFromDocument = function() {
    var a = this._block.view, b = a.getContentPos(), c = a.getAbsoluteCoordinate(), a = a.getBoard().svgDom.offset();
    return {x:c.x + this.box.x + b.x + a.left, y:c.y + this.box.y + b.y + a.top - $(window).scrollTop()};
  };
  b.getRelativePos = function() {
    var a = this._block.view.getContentPos(), b = this.box;
    return {x:b.x + a.x, y:b.y + a.y};
  };
  b.truncate = function() {
    var a = String(this.getValue()), b = this.TEXT_LIMIT_LENGTH, c = a.substring(0, b);
    a.length > b && (c += "...");
    return c;
  };
  b.appendSvgOptionGroup = function() {
    return this._block.view.getBoard().svgGroup.elem("g");
  };
  b.getValue = function() {
    var a = this._block.params[this._index];
    if (this._contents && this._contents.reference && this._contents.reference.length) {
      var b = this._contents.reference.concat();
      "%" === b[0][0] && (a = this._block.params[parseInt(b.shift().substr(1)) - 1]);
      return a ? a.getDataByPointer(b) : a;
    }
    return a;
  };
  b.setValue = function(a, b) {
    if (this.value != a) {
      this.value = a;
      if (this._contents && this._contents.reference && this._contents.reference.length) {
        var c = this._contents.reference.concat(), e = c.pop(), f = this._block.params[this._index];
        c.length && "%" === c[0][0] && (f = this._block.params[parseInt(c.shift().substr(1)) - 1]);
        c.length && (f = f.getDataByPointer(c));
        f.params[e] = a;
      } else {
        this._block.params[this._index] = a;
      }
      b && this._blockView.reDraw();
    }
  };
  b._isEditable = function() {
    if (Entry.ContextMenu.visible || this._block.view.dragMode == Entry.DRAG_MODE_DRAG) {
      return !1;
    }
    var a = this._block.view, b = a.getBoard();
    if (!0 === b.disableMouseEvent) {
      return !1;
    }
    var c = b.workspace.selectedBlockView;
    if (!c || b != c.getBoard()) {
      return !1;
    }
    b = a.getSvgRoot();
    return b == c.svgGroup || $(b).has($(a.svgGroup));
  };
  b._selectBlockView = function() {
    var a = this._block.view;
    a.getBoard().setSelectedBlock(a);
  };
  b._bindRenderOptions = function() {
    var a = this;
    $(this.svgGroup).bind("mouseup touchend", function(b) {
      a._isEditable() && (a.destroyOption(), a._startValue = a.getValue(), a.renderOptions());
    });
  };
  b.pointer = function(a) {
    a = a || [];
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
  b.getFontSize = function(a) {
    return a = a || this._blockView.getSkeleton().fontSize || 12;
  };
  b.getContentHeight = function() {
    return Entry.isMobile() ? 22 : 16;
  };
})(Entry.Field.prototype);
Entry.FieldAngle = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = d;
  b = this.getValue();
  this.setValue(this.modValue(void 0 !== b ? b : 90));
  this._CONTENT_HEIGHT = this.getContentHeight();
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldAngle);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:4, y:4, "font-size":"11px"});
    this.textElement.textContent = this.getText();
    var a = this.getTextWidth(), b = this._CONTENT_HEIGHT, c = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:c - b / 2, rx:3, ry:3, width:a, height:b, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:b});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.value);
    this.optionGroup.on("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(b) {
      var d = b.keyCode || b.which;
      a.applyValue(b);
      -1 < [13, 27].indexOf(d) && a.destroyOption();
    });
    var b = this.getAbsolutePosFromDocument();
    b.y -= this.box.height / 2;
    this.optionGroup.css({height:this._CONTENT_HEIGHT, left:b.x, top:b.y, width:a.box.width});
    this.svgOptionGroup = this.appendSvgOptionGroup();
    this.svgOptionGroup.elem("circle", {x:0, y:0, r:49, class:"entry-field-angle-circle"});
    $(this.svgOptionGroup).on("mousedown touchstart", function(b) {
      b.stopPropagation();
      a._updateByCoord(b);
    });
    this._dividerGroup = this.svgOptionGroup.elem("g");
    for (b = 0;360 > b;b += 15) {
      this._dividerGroup.elem("line", {x1:49, y1:0, x2:49 - (0 === b % 45 ? 10 : 5), y2:0, transform:"rotate(" + b + ", 0, 0)", class:"entry-angle-divider"});
    }
    b = this.getAbsolutePosFromBoard();
    b.x += this.box.width / 2;
    b.y = b.y + this.box.height / 2 + 49 + 1;
    this.svgOptionGroup.attr({class:"entry-field-angle", transform:"translate(" + b.x + "," + b.y + ")"});
    $(this.svgOptionGroup).bind("mousemove touchmove", this._updateByCoord.bind(this));
    $(this.svgOptionGroup).bind("mouseup touchend", this.destroyOption.bind(this));
    this.updateGraph();
    this.optionGroup.focus();
    this.optionGroup.select();
  };
  b._updateByCoord = function(a) {
    a.originalEvent && a.originalEvent.touches && (a = a.originalEvent.touches[0]);
    a = [a.clientX, a.clientY];
    var b = this.getAbsolutePosFromDocument();
    this.optionGroup.val(this.modValue(function(a, b) {
      var d = b[0] - a[0], g = b[1] - a[1] - 49 - 1, h = Math.atan(-g / d), h = Entry.toDegrees(h), h = 90 - h;
      0 > d ? h += 180 : 0 < g && (h += 360);
      return 15 * Math.round(h / 15);
    }([b.x + this.box.width / 2, b.y + this.box.height / 2 + 1], a)));
    this.applyValue();
  };
  b.updateGraph = function() {
    this._fillPath && this._fillPath.remove();
    var a = Entry.toRadian(this.getValue()), b = 49 * Math.sin(a), c = -49 * Math.cos(a), a = a > Math.PI ? 1 : 0;
    this._fillPath = this.svgOptionGroup.elem("path", {d:"M 0,0 v -49 A 49,49 0 %LARGE 1 %X,%Y z".replace("%X", b).replace("%Y", c).replace("%LARGE", a), class:"entry-angle-fill-area"});
    this.svgOptionGroup.appendChild(this._dividerGroup);
    this._indicator && this._indicator.remove();
    this._indicator = this.svgOptionGroup.elem("line", {x1:0, y1:0, x2:b, y2:c});
    this._indicator.attr({class:"entry-angle-indicator"});
  };
  b.applyValue = function() {
    var a = this.optionGroup.val();
    isNaN(a) || "" === a || (a = this.modValue(a), this.setValue(a), this.updateGraph(), this.textElement.textContent = this.getValue(), this.optionGroup && this.optionGroup.val(a), this.resize());
  };
  b.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup && this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement ? this.textElement.getComputedTextLength() + 8 : 8;
  };
  b.getText = function() {
    return this.getValue() + "\u00b0";
  };
  b.modValue = function(a) {
    return a % 360;
  };
  b.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.svgOptionGroup && (this.svgOptionGroup.remove(), delete this.svgOptionGroup);
    this.textElement.textContent = this.getText();
    this.command();
  };
})(Entry.FieldAngle.prototype);
Entry.FieldBlock = function(b, a, d, c, e) {
  Entry.Model(this, !1);
  this._blockView = a;
  this._block = a.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = d;
  this.contentIndex = e;
  this._content = b;
  this.acceptType = b.accept;
  this._restoreCurrent = b.restore;
  this.view = this;
  this.svgGroup = null;
  this._position = b.position;
  this.box.observe(a, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard(), c);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldBlock);
(function(b) {
  b.schema = {magneting:!1};
  b.renderStart = function(a, b) {
    this.svgGroup || (this.svgGroup = this._blockView.contentSvgGroup.elem("g"));
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var c = this.getValue();
    c && !c.view ? (c.setThread(this), c.createView(a, b), c.getThread().view.setParent(this)) : c && c.view && c.view.reDraw();
    this.updateValueBlock(c);
    this._blockView.getBoard().constructor !== Entry.Board && this._valueBlock.view.removeControl();
  };
  b.align = function(a, b, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = this._valueBlock;
    f && f && f.view && (b = -.5 * f.view.height);
    f = "translate(" + a + "," + b + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.calcWH = function() {
    var a = this._valueBlock;
    a && a && a.view ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:15, height:20});
  };
  b.calcHeight = b.calcWH;
  b.destroy = function() {
  };
  b.inspectBlock = function() {
    var a = null;
    if (this._originBlock) {
      a = this._originBlock.type, delete this._originBlock;
    } else {
      switch(this.acceptType) {
        case "boolean":
          a = "True";
          break;
        case "string":
          a = "text";
          break;
        case "param":
          a = "function_field_label";
      }
    }
    return this._createBlockByType(a);
  };
  b._setValueBlock = function(a) {
    this._restoreCurrent && (this._originBlock = this._valueBlock);
    a || (a = this.inspectBlock());
    this._valueBlock = a;
    this.setValue(a);
    a.setThread(this);
    a.getThread().view.setParent(this);
    return this._valueBlock;
  };
  b.getValueBlock = function() {
    return this._valueBlock;
  };
  b.updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    a && a === this._valueBlock ? this.calcWH() : (this._destroyObservers(), a = this._setValueBlock(a).view, a.bindPrev(this), this._blockView.alignContent(), this._posObserver = a.observe(this, "updateValueBlock", ["x", "y"], !1), this._sizeObserver = a.observe(this, "calcWH", ["width", "height"]), a = this._blockView.getBoard(), a.constructor === Entry.Board && a.generateCodeMagnetMap());
  };
  b._destroyObservers = function() {
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
  };
  b.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  b.getNextBlock = function() {
    return null;
  };
  b.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var b = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + b.x;
    a.y += this.box.y + b.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.isGlobal = function() {
    return !1;
  };
  b.separate = function(a) {
    this.getCode().createThread([a]);
    this.calcWH();
    this.changeEvent.notify();
  };
  b.getCode = function() {
    return this._block.thread.getCode();
  };
  b.cut = function(a) {
    return this._valueBlock === a ? [a] : null;
  };
  b.replace = function(a) {
    "string" === typeof a && (a = this._createBlockByType(a));
    var b = this._valueBlock;
    Entry.block[b.type].isPrimitive ? (b.doNotSplice = !0, b.destroy()) : "param" === this.acceptType ? (this._destroyObservers(), b.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(b)) : (this._destroyObservers(), b.view._toGlobalCoordinate(), this.separate(b), b.view.bumpAway(30, 150));
    this.updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
    this.changeEvent.notify();
  };
  b.setParent = function(a) {
    this._parent = a;
  };
  b.getParent = function() {
    return this._parent;
  };
  b._createBlockByType = function(a) {
    this._block.getThread();
    var b = this._blockView.getBoard();
    a = new Entry.Block({type:a}, this);
    var c = b.workspace, e;
    c && (e = c.getMode());
    a.createView(b, e);
    return a;
  };
  b.spliceBlock = function() {
    this.updateValueBlock();
  };
  b._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m 8,12 l -4,0 -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2 l 4,0 z", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0,12)"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  b.getThread = function() {
    return this;
  };
  b.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldBlock.prototype);
Entry.FieldColor = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._index = d;
  this._position = b.position;
  this.key = b.key;
  this.setValue(this.getValue() || "#FF0000");
  this._CONTENT_HEIGHT = this.getContentHeight();
  this._CONTENT_WIDTH = this.getContentWidth();
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldColor);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-field-color"});
    var a = this._CONTENT_HEIGHT, b = this._CONTENT_WIDTH, c = this._position, e;
    c ? (e = c.x || 0, c = c.y || 0) : (e = 0, c = -a / 2);
    this._header = this.svgGroup.elem("rect", {x:e, y:c, width:b, height:a, fill:this.getValue()});
    this._bindRenderOptions();
    this.box.set({x:e, y:c, width:b, height:a});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    var b = Entry.FieldColor.getWidgetColorList();
    this.optionGroup = Entry.Dom("table", {class:"entry-widget-color-table", parent:$("body")});
    for (var c = 0;c < b.length;c++) {
      for (var e = Entry.Dom("tr", {class:"entry-widget-color-row", parent:this.optionGroup}), f = 0;f < b[c].length;f++) {
        var g = Entry.Dom("td", {class:"entry-widget-color-cell", parent:e}), h = b[c][f];
        g.css({"background-color":h});
        g.attr({"data-color-value":h});
        (function(b, c) {
          b.mousedown(function(a) {
            a.stopPropagation();
          });
          b.mouseup(function(b) {
            a.applyValue(c);
            a.destroyOption();
            a._selectBlockView();
          });
        })(g, h);
      }
    }
    b = this.getAbsolutePosFromDocument();
    b.y += this.box.height / 2 + 1;
    this.optionGroup.css({left:b.x, top:b.y});
  };
  b.applyValue = function(a) {
    this.value != a && (this.setValue(a), this._header.attr({fill:a}));
  };
  b.getContentWidth = function() {
    return Entry.isMobile() ? 20 : 14.5;
  };
})(Entry.FieldColor.prototype);
Entry.FieldColor.getWidgetColorList = function() {
  return ["#FFFFFF #CCCCCC #C0C0C0 #999999 #666666 #333333 #000000".split(" "), "#FFCCCC #FF6666 #FF0000 #CC0000 #990000 #660000 #330000".split(" "), "#FFCC99 #FF9966 #FF9900 #FF6600 #CC6600 #993300 #663300".split(" "), "#FFFF99 #FFFF66 #FFCC66 #FFCC33 #CC9933 #996633 #663333".split(" "), "#FFFFCC #FFFF33 #FFFF00 #FFCC00 #999900 #666600 #333300".split(" "), "#99FF99 #66FF99 #33FF33 #33CC00 #009900 #006600 #003300".split(" "), "#99FFFF #33FFFF #66CCCC #00CCCC #339999 #336666 #003333".split(" "), "#CCFFFF #66FFFF #33CCFF #3366FF #3333FF #000099 #000066".split(" "), 
  "#CCCCFF #9999FF #6666CC #6633FF #6609CC #333399 #330099".split(" "), "#FFCCFF #FF99FF #CC66CC #CC33CC #993399 #663366 #330033".split(" ")];
};
Entry.FieldDropdown = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._noArrow = b.noArrow;
  this._arrowColor = b.arrowColor;
  this._index = d;
  this.setValue(this.getValue());
  this._CONTENT_HEIGHT = this.getContentHeight(b.dropdownHeight);
  this._FONT_SIZE = this.getFontSize(b.fontSize);
  this._ROUND = b.roundValue || 3;
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldDropdown);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this instanceof Entry.FieldDropdownDynamic && this._updateValue();
    var a = this._blockView, b = Entry.isMobile(), c = b ? 33 : 20, b = b ? 24 : 10;
    this.svgGroup = a.contentSvgGroup.elem("g", {class:"entry-field-dropdown"});
    this.textElement = this.svgGroup.elem("text", {x:5});
    this.textElement.textContent = this.getTextByValue(this.getValue());
    a = this.textElement.getBBox();
    this.textElement.attr({style:"white-space: pre;", "font-size":+this._FONT_SIZE + "px", y:.23 * a.height});
    c = this.textElement.getBoundingClientRect().width + c;
    this._noArrow && (c -= b);
    b = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:c, height:b, y:-b / 2, rx:this._ROUND, ry:this._ROUND, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._noArrow || (a = this.getArrow(), this._arrow = this.svgGroup.elem("polygon", {points:a.points, fill:a.color, stroke:a.color, transform:"translate(" + (c - a.width - 5) + "," + -a.height / 2 + ")"}));
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:c, height:b});
  };
  b.resize = function() {
    var a = Entry.isMobile(), b = a ? 33 : 20, a = a ? 24 : 10, b = this.textElement.getBoundingClientRect().width + b;
    this._noArrow ? b -= a : (a = this.getArrow(), this._arrow.attr({transform:"translate(" + (b - a.width - 5) + "," + -a.height / 2 + ")"}));
    this._header.attr({width:b});
    this.box.set({width:b});
    this._block.view.alignContent();
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    for (var b = this._contents.options, b = this._contents.options, c = 0, e = b.length;c < e;c++) {
      var f = b[c], g = f[0], f = f[1], h = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), k = Entry.Dom("span", {class:"left", parent:h});
      Entry.Dom("span", {class:"right", parent:h}).text(g);
      this.getValue() == f && k.text("\u2713");
      (function(b, c) {
        b.bind("mousedown touchstart", function(a) {
          a.stopPropagation();
        });
        b.bind("mouseup touchend", function(b) {
          b.stopPropagation();
          a.applyValue(c);
          a.destroyOption();
          a._selectBlockView();
        });
      })(h, f);
    }
    this._position();
  };
  b._position = function() {
    var a = this.getAbsolutePosFromDocument();
    a.y += this.box.height / 2;
    var b = $(document).height(), c = this.optionGroup.height(), e = this.optionGroup.width() + 30;
    if (b < a.y + c + 30) {
      var b = this._blockView.getBoard().svgDom.height(), f = this.getAbsolutePosFromBoard();
      this._blockView.y < b / 2 ? (a.x += this.box.width / 2 - e / 2, b -= f.y + 30, this.optionGroup.height(b)) : (a.x += this.box.width + 1, b -= b - f.y, b - 30 < c && this.optionGroup.height(b - b % 30), a.y -= this.optionGroup.height());
    } else {
      a.x += this.box.width / 2 - e / 2;
    }
    this.optionGroup.addClass("rendered");
    this.optionGroup.css({left:a.x, top:a.y, width:e});
    this.optionGroup.find(".right").width(e - 20);
  };
  b.applyValue = function(a) {
    this.value != a && this.setValue(a);
    this.textElement.textContent = this.getTextByValue(a);
    this.resize();
  };
  b.getTextByValue = function(a) {
    if (!a && "number" !== typeof a || "null" === a) {
      return Lang.Blocks.no_target;
    }
    for (var b = this._contents.options, c = 0, e = b.length;c < e;c++) {
      var f = b[c];
      if (f[1] == a) {
        return f[0];
      }
    }
    return "?" === a ? a : Lang.Blocks.no_target;
  };
  b.getContentHeight = function(a) {
    return a = a || this._blockView.getSkeleton().dropdownHeight || (Entry.isMobile() ? 22 : 16);
  };
  b.getArrow = function() {
    var a = Entry.isMobile();
    return {color:this._arrowColor || this._blockView._schema.color, points:a ? "0,0 19,0 9.5,13" : "0,0 6.4,0 3.2,4.2", height:a ? 13 : 4.2, width:a ? 19 : 6.4};
  };
})(Entry.FieldDropdown.prototype);
Entry.FieldDropdownDynamic = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._index = d;
  this._arrowColor = b.arrowColor;
  d = this._contents.menuName;
  Entry.Utils.isFunction(d) ? this._menuGenerator = d : this._menuName = d;
  this._CONTENT_HEIGHT = this.getContentHeight(b.dropdownHeight);
  this._FONT_SIZE = this.getFontSize(b.fontSize);
  this._ROUND = b.roundValue || 3;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.FieldDropdown, Entry.FieldDropdownDynamic);
(function(b) {
  b.constructor = Entry.FieldDropDownDynamic;
  b._updateValue = function() {
    var a = this._block.getCode().object, b = [];
    Entry.container && (b = this._menuName ? Entry.container.getDropdownList(this._menuName, a) : this._menuGenerator());
    this._contents.options = b;
    a = this.getValue();
    if (this._blockView.isInBlockMenu || !a || "null" == a) {
      a = 0 !== b.length ? b[0][1] : null;
    }
    this.setValue(a);
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    var b;
    b = this._menuName ? Entry.container.getDropdownList(this._contents.menuName) : this._menuGenerator();
    this._contents.options = b;
    for (var c = 0;c < b.length;c++) {
      var e = b[c], f = e[0], e = e[1], g = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), h = Entry.Dom("span", {class:"left", parent:g});
      Entry.Dom("span", {class:"right", parent:g}).text(f);
      this.getValue() == e && h.text("\u2713");
      (function(b, c) {
        b.mousedown(function(a) {
          a.stopPropagation();
        });
        b.mouseup(function(b) {
          b.stopPropagation();
          a.applyValue(c);
          a.destroyOption();
          a._selectBlockView();
        });
      })(g, e);
    }
    this._position();
  };
})(Entry.FieldDropdownDynamic.prototype);
Entry.FieldImage = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this._content = b;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._imgElement = this._path = this.svgGroup = null;
  this._index = d;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldImage);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? this._content.img.replace(".png", "_un.png") : this._content.img;
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:this._imgUrl, x:0, y:-.5 * this._size, width:this._size, height:this._size});
    this.box.set({x:this._size, y:0, width:this._size, height:this._size});
  };
})(Entry.FieldImage.prototype);
Entry.FieldIndicator = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  b.img ? this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? b.img.replace(".png", "_un.png") : b.img : b.color && (this._color = b.color);
  this._boxMultiplier = b.boxMultiplier || 2;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._index = d;
  this._imgElement = this._path = this.svgGroup = null;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldIndicator);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgUrl && (this._imgElement = this.svgGroup.elem("image", {href:Entry.mediaFilePath + this._imgUrl, x:this._position ? -1 * this._size : 0, y:-1 * this._size, width:2 * this._size, height:2 * this._size}));
    var a = "m %s,-%s a %s,%s 0 1,1 -0.1,0 z".replace(/%s/gi, this._size);
    this._path = this.svgGroup.elem("path", {d:a, x:this._position ? -1 * this._size : 0, y:-1 * this._size, stroke:"none", fill:this._color ? this._color : "none"});
    this.box.set({width:this._size * this._boxMultiplier + (this._position ? -this._size : 0), height:this._size * this._boxMultiplier});
  };
  b.enableHighlight = function() {
    var a = this._path.getTotalLength(), b = this._path;
    this._path.attr({stroke:this._highlightColor, strokeWidth:2, "stroke-linecap":"round", "stroke-dasharray":a + " " + a, "stroke-dashoffset":a});
    setInterval(function() {
      b.attr({"stroke-dashoffset":a}).animate({"stroke-dashoffset":0}, 300);
    }, 1400, mina.easeout);
    setTimeout(function() {
      setInterval(function() {
        b.animate({"stroke-dashoffset":-a}, 300);
      }, 1400, mina.easeout);
    }, 500);
  };
})(Entry.FieldIndicator.prototype);
Entry.Keyboard = {};
Entry.FieldKeyboard = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = d;
  this.setValue(String(this.getValue()));
  this._CONTENT_HEIGHT = this.getContentHeight();
  this._optionVisible = !1;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldKeyboard);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text").attr({x:5, y:4, "font-size":"11px"});
    this.textElement.textContent = Entry.getKeyCodeMap()[this.getValue()];
    var a = this.getTextWidth() + 1, b = this._CONTENT_HEIGHT, c = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:c - b / 2, width:a, height:b, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:b});
  };
  b.renderOptions = function() {
    Entry.keyPressed && (this.keyPressed = Entry.keyPressed.attach(this, this._keyboardControl));
    this._optionVisible = !0;
    this._attachDisposeEvent();
    var a = this.getAbsolutePosFromDocument();
    a.x -= this.box.width / 2;
    a.y += this.box.height / 2 + 1;
    this.optionGroup = Entry.Dom("img", {class:"entry-widget-keyboard-input", src:Entry.mediaFilePath + "/media/keyboard_workspace.png", parent:$("body")});
    this.optionGroup.css({left:a.x, top:a.y});
  };
  b.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.disposeEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this._optionVisible = !1;
    this.command();
    this.keyPressed && (Entry.keyPressed.detach(this.keyPressed), delete this.keyPressed);
  };
  b._keyboardControl = function(a) {
    a.stopPropagation();
    if (this._optionVisible) {
      a = a.keyCode;
      var b = Entry.getKeyCodeMap()[a];
      void 0 !== b && this.applyValue(b, a);
    }
  };
  b.applyValue = function(a, b) {
    this.setValue(String(b));
    this.destroyOption();
    this.textElement.textContent = a;
    this.resize();
  };
  b.resize = function() {
    var a = this.getTextWidth() + 1;
    this._header.attr({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 10;
  };
  b.destroy = function() {
    this.destroyOption();
    Entry.keyPressed && this.keyPressed && Entry.keyPressed.detach(this.keyPressed);
  };
})(Entry.FieldKeyboard.prototype);
Entry.FieldLineBreak = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this._index = d;
  this.box = new Entry.BoxModel;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldLineBreak);
(function(b) {
  b.renderStart = function() {
  };
  b.align = function(a) {
    var b = this._blockView;
    0 !== b._statements.length && this.box.set({y:(b._statements[a].height || 20) + Math.max(b.contentHeight % 1E3, 30)});
  };
})(Entry.FieldLineBreak.prototype);
Entry.FieldOutput = function(b, a, d, c, e) {
  Entry.Model(this, !1);
  this._blockView = a;
  this._block = a.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = d;
  this.contentIndex = e;
  this._content = b;
  this.acceptType = b.accept;
  this.view = this;
  this.svgGroup = null;
  this._position = b.position;
  this.box.observe(a, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard(), c);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldOutput);
(function(b) {
  b.schema = {magneting:!1};
  b.renderStart = function(a, b) {
    this.svgGroup || (this.svgGroup = this._blockView.contentSvgGroup.elem("g"));
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var c = this.getValue();
    c && !c.view ? (c.setThread(this), c.createView(a, b)) : c && c.view && c.view.reDraw();
    this._updateValueBlock(c);
    this._blockView.getBoard().constructor == Entry.BlockMenu && this._valueBlock && this._valueBlock.view.removeControl();
  };
  b.align = function(a, b, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = this._valueBlock;
    f && (b = -.5 * f.view.height);
    f = "translate(" + a + "," + b + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.calcWH = function() {
    var a = this._valueBlock;
    a ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:0, height:20});
  };
  b.calcHeight = b.calcWH;
  b.destroy = function() {
  };
  b._inspectBlock = function() {
  };
  b._setValueBlock = function(a) {
    if (a != this._valueBlock || !this._valueBlock) {
      return this._valueBlock = a, this.setValue(a), a && a.setThread(this), this._valueBlock;
    }
  };
  b._updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    a && a === this._valueBlock ? this.calcWH() : (this._sizeObserver && this._sizeObserver.destroy(), this._posObserver && this._posObserver.destroy(), (a = this._setValueBlock(a)) ? (a = a.view, a.bindPrev(), this._posObserver = a.observe(this, "_updateValueBlock", ["x", "y"], !1), this._sizeObserver = a.observe(this, "calcWH", ["width", "height"])) : this.calcWH(), this._blockView.alignContent());
  };
  b.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  b.getNextBlock = function() {
    return null;
  };
  b.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var b = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + b.x;
    a.y += this.box.y + b.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.isGlobal = function() {
    return !1;
  };
  b.separate = function(a) {
    this.getCode().createThread([a]);
    this.changeEvent.notify();
  };
  b.getCode = function() {
    return this._block.thread.getCode();
  };
  b.cut = function(a) {
    return this._valueBlock === a ? (delete this._valueBlock, [a]) : null;
  };
  b._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m -4,-12 h 3 l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2 h -3 ", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0," + (this._valueBlock ? 12 : 0) + ")"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  b.replace = function(a) {
    var b = this._valueBlock;
    b && (b.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(b));
    this._updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
  };
  b.setParent = function(a) {
    this._parent = a;
  };
  b.getParent = function() {
    return this._parent;
  };
  b.getThread = function() {
    return this;
  };
  b.getValueBlock = function() {
    return this._valueBlock;
  };
  b.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldOutput.prototype);
Entry.FieldStatement = function(b, a, d) {
  Entry.Model(this, !1);
  this._blockView = a;
  this.block = a.block;
  this.view = this;
  this._index = d;
  this.acceptType = b.accept;
  this._thread = this.statementSvgGroup = this.svgGroup = null;
  this._position = b.position;
  this._events = [];
  this.observe(a, "alignContent", ["height"], !1);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard());
};
(function(b) {
  b.schema = {x:0, y:0, width:100, height:20, magneting:!1};
  b.magnet = {next:{x:0, y:0}};
  b.renderStart = function(a) {
    this.svgGroup = this._blockView.statementSvgGroup.elem("g");
    this._nextGroup = this.statementSvgGroup = this.svgGroup.elem("g");
    this._initThread(a);
    this._board = a;
  };
  b._initThread = function(a) {
    var b = this.getValue();
    this._thread = b;
    b.createView(a);
    b.view.setParent(this);
    if (a = b.getFirstBlock()) {
      a.view._toLocalCoordinate(this.statementSvgGroup), this.firstBlock = a;
    }
    a = b.changeEvent.attach(this, this.calcHeight);
    var c = b.changeEvent.attach(this, this.checkTopBlock);
    this._events.push([b.changeEvent, a]);
    this._events.push([b.changeEvent, c]);
    this.calcHeight();
  };
  b.align = function(a, b, c) {
    c = void 0 === c ? !0 : c;
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = "translate(" + a + "," + b + ")";
    this.set({x:a, y:b});
    c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
  };
  b.calcHeight = function() {
    var a = this._thread.view.requestPartHeight(null);
    this.set({height:a});
  };
  b.getValue = function() {
    return this.block.statements[this._index];
  };
  b.requestAbsoluteCoordinate = function() {
    var a = this._blockView.getAbsoluteCoordinate();
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.destroy = function() {
    for (;this._events.length;) {
      var a = this._events.pop();
      a[0].detach(a[1]);
    }
  };
  b._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      if (this.magneting) {
        var a = this._board.dragBlock.getShadow(), b = this.requestAbsoluteCoordinate(), b = "translate(" + b.x + "," + b.y + ")";
        $(a).attr({transform:b, display:"block"});
        this._clonedShadow = a;
        this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
        a = this._board.dragBlock.getBelowHeight();
        this.statementSvgGroup.attr({transform:"translate(0," + a + ")"});
        this.set({height:this.height + a});
      } else {
        this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), delete this.originalHeight), this.statementSvgGroup.attr({transform:"translate(0,0)"}), this.calcHeight();
      }
      (a = this.block.thread.changeEvent) && a.notify();
    }
  };
  b.insertTopBlock = function(a) {
    this._posObserver && this._posObserver.destroy();
    var b = this.firstBlock;
    (this.firstBlock = a) && a.doInsert(this._thread);
    return b;
  };
  b.getNextBlock = function() {
    return this.firstBlock;
  };
  b.checkTopBlock = function() {
    var a = this._thread.getFirstBlock();
    a && this.firstBlock !== a ? (this.firstBlock = a, a.view.bindPrev(this), a._updatePos()) : a || (this.firstBlock = null);
  };
})(Entry.FieldStatement.prototype);
Entry.FieldText = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this._index = d;
  this.box = new Entry.BoxModel;
  this._fontSize = b.fontSize || a.getSkeleton().fontSize || 12;
  this._color = b.color || this._block.getSchema().fontColor || a.getSkeleton().color || "white";
  this._align = b.align || "left";
  this._text = this.getValue() || b.text;
  this.setValue(null);
  this.textElement = null;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldText);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._text = this._text.replace(/(\r\n|\n|\r)/gm, " ");
    this.textElement = this.svgGroup.elem("text").attr({style:"white-space: pre;", "font-size":this._fontSize + "px", "font-family":"nanumBarunRegular", "class":"dragNone", fill:this._color});
    this.textElement.textContent = this._text;
    var a = 0, b = this.textElement.getBoundingClientRect();
    "center" == this._align && (a = -b.width / 2);
    this.textElement.attr({x:a, y:.25 * b.height});
    this.box.set({x:0, y:0, width:b.width, height:b.height});
  };
})(Entry.FieldText.prototype);
Entry.FieldTextInput = function(b, a, d) {
  this._blockView = a;
  this._block = a.block;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = d;
  this.value = this.getValue() || "";
  this._CONTENT_HEIGHT = this.getContentHeight();
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldTextInput);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.svgGroup.attr({class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:3, y:4, "font-size":"12px"});
    this.textElement.textContent = this.truncate();
    var a = this.getTextWidth(), b = this.position && this.position.y ? this.position.y : 0, c = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:a, height:c, y:b - c / 2, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:c});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.getValue());
    this.optionGroup.on("mousedown", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(b) {
      var d = b.keyCode || b.which;
      a.applyValue(b);
      -1 < [13, 27].indexOf(d) && a.destroyOption();
    });
    var b = this.getAbsolutePosFromDocument();
    b.y -= this.box.height / 2;
    this.optionGroup.css({height:this._CONTENT_HEIGHT, left:b.x, top:b.y, width:a.box.width});
    this.optionGroup.focus();
    b = this.optionGroup[0];
    b.setSelectionRange(0, b.value.length, "backward");
  };
  b.applyValue = function(a) {
    a = this.optionGroup.val();
    this.setValue(a);
    this.textElement.textContent = this.truncate();
    this.resize();
  };
  b.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement.getBoundingClientRect().width + 6 + 2;
  };
})(Entry.FieldTextInput.prototype);
Entry.GlobalSvg = {};
(function(b) {
  b.DONE = 0;
  b._inited = !1;
  b.REMOVE = 1;
  b.RETURN = 2;
  b.createDom = function() {
    if (!this.inited) {
      $("#globalSvgSurface").remove();
      $("#globalSvg").remove();
      var a = $("body");
      this._container = Entry.Dom("div", {classes:["globalSvgSurface", "entryRemove"], id:"globalSvgSurface", parent:a});
      this.svgDom = Entry.Dom($('<svg id="globalSvg" width="10" height="10"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this._container});
      this.svg = Entry.SVG("globalSvg");
      this.top = this.left = 0;
      this._inited = !0;
    }
  };
  b.setView = function(a, b) {
    if (a != this._view && !a.block.isReadOnly() && a.movable) {
      return this._view = a, this._mode = b, b !== Entry.Workspace.MODE_VIMBOARD && a.set({visible:!1}), this.draw(), this.show(), this.align(), this.position(), !0;
    }
  };
  b.draw = function() {
    var a = this._view;
    this._svg && this.remove();
    var b = this._mode == Entry.Workspace.MODE_VIMBOARD;
    this.svgGroup = Entry.SVG.createElement(a.svgGroup.cloneNode(!0), {opacity:1});
    this.svg.appendChild(this.svgGroup);
    b && (a = $(this.svgGroup), a.find("g").css({filter:"none"}), a.find("path").velocity({opacity:0}, {duration:500}), a.find("text").velocity({fill:"#000000"}, {duration:530}));
  };
  b.remove = function() {
    this.svgGroup && (this.svgGroup.remove(), delete this.svgGroup, delete this._view, delete this._offsetX, delete this._offsetY, delete this._startX, delete this._startY, this.hide());
  };
  b.align = function() {
    var a = this._view.getSkeleton().box(this._view).offsetX || 0, b = this._view.getSkeleton().box(this._view).offsetY || 0, a = -1 * a + 1, b = -1 * b + 1;
    this._offsetX = a;
    this._offsetY = b;
    this.svgGroup.attr({transform:"translate(" + a + "," + b + ")"});
  };
  b.show = function() {
    this._container.removeClass("entryRemove");
  };
  b.hide = function() {
    this._container.addClass("entryRemove");
  };
  b.position = function() {
    var a = this._view;
    if (a) {
      var b = a.getAbsoluteCoordinate(), a = a.getBoard().offset();
      this.left = b.x + a.left - this._offsetX;
      this.top = b.y + a.top - this._offsetY;
      this.svgDom.css({transform:"translate3d(" + this.left + "px," + this.top + "px, 0px)"});
    }
  };
  b.terminateDrag = function(a) {
    var b = Entry.mouseCoordinate, c = a.getBoard(), e = c.workspace.blockMenu, f = e.offset().left, g = e.offset().top, h = e.visible ? e.svgDom.width() : 0;
    return b.y > c.offset().top - 20 && b.x > f + h ? this.DONE : b.y > g && b.x > f && e.visible ? a.block.isDeletable() ? this.REMOVE : this.RETURN : this.RETURN;
  };
  b.addControl = function(a) {
    this.onMouseDown.apply(this, arguments);
  };
  b.onMouseDown = function(a) {
    function b(a) {
      var c = a.pageX;
      a = a.pageY;
      var d = e.left + (c - e._startX), f = e.top + (a - e._startY);
      e.svgDom.css({transform:"translate3d(" + d + "px," + f + "px, 0px)"});
      e._startX = c;
      e._startY = a;
      e.left = d;
      e.top = f;
    }
    function c(a) {
      $(document).unbind(".block");
    }
    this._startY = a.pageY;
    var e = this;
    a.stopPropagation();
    a.preventDefault();
    var f = $(document);
    f.bind("mousemove.block", b);
    f.bind("mouseup.block", c);
    f.bind("touchmove.block", b);
    f.bind("touchend.block", c);
    this._startX = a.pageX;
    this._startY = a.pageY;
  };
})(Entry.GlobalSvg);
Entry.Mutator = function() {
};
(function(b) {
  b.mutate = function(a, b) {
    var c = Entry.block[a];
    void 0 === c.changeEvent && (c.changeEvent = new Entry.Event);
    c.template = b.template;
    c.params = b.params;
    c.changeEvent.notify(1);
  };
})(Entry.Mutator);
(function(b) {
})(Entry.Mutator.prototype);
Entry.RenderView = function(b, a, d) {
  this._align = a || "CENTER";
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = b;
  this.viewOnly = !0;
  this.suffix = "renderView";
  this._scale = void 0 === d ? 1 : d;
  this.disableMouseEvent = this.visible = !0;
  this._svgId = "renderView_" + (new Date).getTime();
  this._generateView();
  this.offset = this.svgDom.offset();
  this._minBlockOffsetX = 0;
  this._setSize();
  this.svg = Entry.SVG(this._svgId, this.svgDom[0]);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.svg && (this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
};
(function(b) {
  b.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  b._generateView = function() {
    this.renderViewContainer = Entry.Dom("div", {"class":"renderViewContainer", parent:this.view});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="renderView" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.renderViewContainer});
  };
  b.changeCode = function(a, b) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.code = a;
    this.svg || (this.svg = Entry.SVG(this._svgId, this.svgDom[0]), this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
    a.createView(this);
    this.align();
    this.resize(b);
  };
  b.align = function() {
    var a = this.code.getThreads();
    if (a && 0 !== a.length) {
      for (var b = 0, c = this._getHorizontalPadding(), e = 0, f = a.length;e < f;e++) {
        var g = a[e].getFirstBlock().view, h = g.svgGroup.getBBox().height, k = 0, l = $(g.svgGroup).find(".extension");
        if (l) {
          for (var m = 0;m < l.length;m++) {
            var n = parseFloat(l[m].getAttribute("x")), k = Math.min(k, n)
          }
        }
        this._minBlockOffsetX = Math.min(this._minBlockOffsetX, g.offsetX);
        g._moveTo(c - k - g.offsetX, b - g.offsetY, !1);
        b += h + 15;
      }
      this._setSize();
    }
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b._setSize = function() {
    this.svgDom && (this._svgWidth = this.svgDom.width(), this.offset = this.svgDom.offset());
    this.svgGroup && (this._bBox = this.svgGroup.getBBox());
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  b.resize = function(a) {
    function b() {
      this._setSize();
      var a = Math.round(this._bBox.width), d = Math.round(this._bBox.height);
      0 !== a && 0 !== d && ($(this.svg).css({width:a + this._getHorizontalPadding() - this._minBlockOffsetX, height:d + 5}), setTimeout(function() {
        var b = this.svgGroup.getBBox();
        Math.round(b.width) === a && Math.round(b.height) === d || this.resize();
      }.bind(this), 1E3));
    }
    this.svg && this._bBox && (a ? b.call(this) : setTimeout(function() {
      b.call(this);
    }.bind(this), 0));
  };
  b.setDomSize = function(a) {
    this.svgBlockGroup && this.svgBlockGroup.attr("transform", "scale(1)");
    this.code.view.reDraw();
    this.align();
    this.resize(a);
    1 !== this._scale && window.setTimeout(function() {
      this.svgBlockGroup.attr("transform", "scale(%scale)".replace("%scale", this._scale));
      this.align();
      this.resize();
    }.bind(this), 0);
  };
  b._getHorizontalPadding = function() {
    var a = {LEFT:20, LEFT_MOST:0}[this._align];
    return void 0 !== a ? a : this.svgDom.width() / 2;
  };
})(Entry.RenderView.prototype);
Entry.Scroller = function(b, a, d) {
  this._horizontal = void 0 === a ? !0 : a;
  this._vertical = void 0 === d ? !0 : d;
  this.board = b;
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hRatio = this.hX = this.hWidth = 0;
  this._visible = !0;
  this._opacity = -1;
  this.createScrollBar();
  this.setOpacity(0);
  this._bindEvent();
  this._scrollCommand = _.debounce(Entry.do, 200);
};
Entry.Scroller.RADIUS = 7;
(function(b) {
  b.createScrollBar = function() {
    var a = Entry.Scroller.RADIUS, b = this;
    this.svgGroup = this.board.svg.elem("g").attr({class:"boardScrollbar"});
    this._horizontal && (this.hScrollbar = this.svgGroup.elem("rect", {height:2 * a, rx:a, ry:a}), this.hScrollbar.mousedown = function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var c = b.dragInstance;
        b.scroll((a.pageX - c.offsetX) / b.hRatio, 0);
        c.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    });
    this._vertical && (this.vScrollbar = this.svgGroup.elem("rect", {width:2 * a, rx:a, ry:a}), this.vScrollbar.mousedown = function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var c = b.dragInstance;
        b.scroll(0, (a.pageY - c.offsetY) / b.vRatio);
        c.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    });
  };
  b.updateScrollBar = function(a, b) {
    this._horizontal && (this.hX += a * this.hRatio, this.hScrollbar.attr({x:this.hX}));
    this._vertical && (this.vY += b * this.vRatio, this.vScrollbar.attr({y:this.vY}));
  };
  b.scroll = function(a, b) {
    if (this.board.code) {
      var c = this.board.svgBlockGroup.getBoundingClientRect(), e = this.board.svgDom, f = c.left - this.board.offset().left, g = c.top - this.board.offset().top, h = c.height;
      a = Math.max(-c.width + Entry.BOARD_PADDING - f, a);
      b = Math.max(-h + Entry.BOARD_PADDING - g, b);
      a = Math.min(e.width() - Entry.BOARD_PADDING - f, a);
      b = Math.min(e.height() - Entry.BOARD_PADDING - g, b);
      this._scroll(a, b);
      this._diffs || (this._diffs = [0, 0]);
      this._diffs[0] += a;
      this._diffs[1] += b;
      this._scrollCommand("scrollBoard", this._diffs[0], this._diffs[1], !0);
    }
  };
  b._scroll = function(a, b) {
    this.board.code.moveBy(a, b);
    this.updateScrollBar(a, b);
  };
  b.setVisible = function(a) {
    a != this.isVisible() && (this._visible = a, this.svgGroup.attr({display:!0 === a ? "block" : "none"}));
  };
  b.isVisible = function() {
    return this._visible;
  };
  b.setOpacity = function(a) {
    this._opacity != a && (this.hScrollbar.attr({opacity:a}), this.vScrollbar.attr({opacity:a}), this._opacity = a);
  };
  b.resizeScrollBar = function() {
    if (this._visible) {
      var a = this.board, b = a.svgBlockGroup.getBoundingClientRect(), c = a.svgDom, e = c.width(), c = c.height(), f = b.left - a.offset().left, a = b.top - a.offset().top, g = b.width, b = b.height;
      if (this._horizontal) {
        var h = -g + Entry.BOARD_PADDING, k = e - Entry.BOARD_PADDING, g = (e + 2 * Entry.Scroller.RADIUS) * g / (k - h + g);
        isNaN(g) && (g = 0);
        this.hX = (f - h) / (k - h) * (e - g - 2 * Entry.Scroller.RADIUS);
        this.hScrollbar.attr({width:g, x:this.hX, y:c - 2 * Entry.Scroller.RADIUS});
        this.hRatio = (e - g - 2 * Entry.Scroller.RADIUS) / (k - h);
      }
      this._vertical && (f = -b + Entry.BOARD_PADDING, g = c - Entry.BOARD_PADDING, b = (c + 2 * Entry.Scroller.RADIUS) * b / (g - f + b), this.vY = (a - f) / (g - f) * (c - b - 2 * Entry.Scroller.RADIUS), this.vScrollbar.attr({height:b, y:this.vY, x:e - 2 * Entry.Scroller.RADIUS}), this.vRatio = (c - b - 2 * Entry.Scroller.RADIUS) / (g - f));
    }
  };
  b._bindEvent = function() {
    var a = _.debounce(this.resizeScrollBar, 200);
    this.board.changeEvent.attach(this, a);
    Entry.windowResized && Entry.windowResized.attach(this, a);
  };
})(Entry.Scroller.prototype);
Entry.Board = function(b) {
  Entry.Model(this, !1);
  this.changeEvent = new Entry.Event(this);
  this.createView(b);
  this.updateOffset();
  this.scroller = new Entry.Scroller(this, !0, !0);
  this._magnetMap = {};
  Entry.ANIMATION_DURATION = 200;
  Entry.BOARD_PADDING = 100;
  this._initContextOptions();
  Entry.Utils.disableContextmenu(this.svgDom);
  this._addControl();
  this._bindEvent();
};
Entry.Board.OPTION_PASTE = 0;
Entry.Board.OPTION_ALIGN = 1;
Entry.Board.OPTION_CLEAR = 2;
Entry.Board.OPTION_DOWNLOAD = 3;
Entry.Board.DRAG_RADIUS = 5;
(function(b) {
  b.schema = {code:null, dragBlock:null, magnetedBlockView:null, selectedBlockView:null};
  b.createView = function(a) {
    var b = a.dom, b = "string" === typeof b ? $("#" + b) : $(b);
    if ("DIV" !== b.prop("tagName")) {
      return console.error("Dom is not div element");
    }
    this.view = b;
    this._svgId = "play" + (new Date).getTime();
    this.workspace = a.workspace;
    this._activatedBlockView = null;
    this.wrapper = Entry.Dom("div", {parent:b, class:"entryBoardWrapper"});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="entryBoard" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.wrapper});
    this.visible = !0;
    var c = this;
    this.svg = Entry.SVG(this._svgId);
    $(window).scroll(function() {
      c.updateOffset();
    });
    this.svgGroup = this.svg.elem("g");
    this.svgThreadGroup = this.svgGroup.elem("g");
    this.svgThreadGroup.board = this;
    this.svgBlockGroup = this.svgGroup.elem("g");
    this.svgBlockGroup.board = this;
    a.isOverlay ? (this.wrapper.addClass("entryOverlayBoard"), this.generateButtons(), this.suffix = "overlayBoard") : this.suffix = "board";
    Entry.Utils.addFilters(this.svg, this.suffix);
    this.pattern = Entry.Utils.addBlockPattern(this.svg, this.suffix).pattern;
  };
  b.changeCode = function(a) {
    this.code && this.codeListener && this.code.changeEvent.detach(this.codeListener);
    this.set({code:a});
    var b = this;
    a && (this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    }), a.createView(this));
    this.scroller.resizeScrollBar();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  b.setMagnetedBlock = function(a, b) {
    if (this.magnetedBlockView) {
      if (this.magnetedBlockView === a) {
        return;
      }
      this.magnetedBlockView.set({magneting:!1});
    }
    this.set({magnetedBlockView:a});
    a && (a.set({magneting:b}), a.dominate());
  };
  b.getCode = function() {
    return this.code;
  };
  b.findById = function(a) {
    return this.code.findById(a);
  };
  b._addControl = function() {
    var a = this.svgDom, b = this;
    a.mousedown(function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.bind("touchstart", function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.on("wheel", function() {
      b.mouseWheel.apply(b, arguments);
    });
    var c = b.scroller;
    c && (a.mouseenter(function(a) {
      c.setOpacity(1);
    }), a.mouseleave(function(a) {
      c.setOpacity(0);
    }));
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = Entry.Utils.convertMouseEvent(a);
      var c = e.mouseDownCoordinate;
      Math.sqrt(Math.pow(a.pageX - c.x, 2) + Math.pow(a.pageY - c.y, 2)) < Entry.Board.DRAG_RADIUS || (f && (clearTimeout(f), f = null), c = e.dragInstance, e.scroller.scroll(a.pageX - c.offsetX, a.pageY - c.offsetY), c.set({offsetX:a.pageX, offsetY:a.pageY}));
    }
    function c(a) {
      f && (clearTimeout(f), f = null);
      $(document).unbind(".entryBoard");
      delete e.mouseDownCoordinate;
      delete e.dragInstance;
    }
    if (this.workspace.getMode() != Entry.Workspace.MODE_VIMBOARD) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      var e = this, f = null;
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        var g = a.type, h = Entry.Utils.convertMouseEvent(a);
        Entry.documentMousedown && Entry.documentMousedown.notify(h);
        var k = $(document);
        this.mouseDownCoordinate = {x:h.pageX, y:h.pageY};
        k.bind("mousemove.entryBoard", b);
        k.bind("mouseup.entryBoard", c);
        k.bind("touchmove.entryBoard", b);
        k.bind("touchend.entryBoard", c);
        this.dragInstance = new Entry.DragInstance({startX:h.pageX, startY:h.pageY, offsetX:h.pageX, offsetY:h.pageY});
        "touchstart" === g && (f = setTimeout(function() {
          f && (f = null, c(), e._rightClick(a));
        }, 1E3));
      } else {
        Entry.Utils.isRightButton(a) && this._rightClick(a);
      }
    }
  };
  b.mouseWheel = function(a) {
    a = a.originalEvent;
    a.preventDefault();
    var b = Entry.disposeEvent;
    b && b.notify(a);
    this.scroller.scroll(a.wheelDeltaX || -a.deltaX, a.wheelDeltaY || -a.deltaY);
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
  b._keyboardControl = function(a) {
    var b = this.selectedBlockView;
    b && 46 == a.keyCode && b.block && !Entry.Utils.isInInput(a) && (Entry.do("destroyBlock", b.block), this.set({selectedBlockView:null}));
  };
  b.hide = function() {
    this.wrapper.addClass("entryRemove");
    this.visible = !1;
  };
  b.show = function() {
    this.wrapper.removeClass("entryRemove");
    this.visible = !0;
  };
  b.alignThreads = function() {
    for (var a = this.svgDom.height(), b = this.code.getThreads(), c = 15, e = 0, a = a - 30, f = 50, g = 0;g < b.length;g++) {
      var h = b[g].getFirstBlock();
      if (h && (h = h.view, h.movable)) {
        var k = h.svgGroup.getBBox(), l = c + 15;
        l > a && (f = f + e + 10, e = 0, c = 15);
        e = Math.max(e, k.width);
        l = c + 15;
        h._moveTo(f - k.x, l, !1);
        c = c + k.height + 15;
      }
    }
    this.scroller.resizeScrollBar();
  };
  b.clear = function() {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
  };
  b.updateOffset = function() {
    this._offset = this.svg.getBoundingClientRect();
    var a = $(window), b = a.scrollTop(), a = a.scrollLeft(), c = this._offset;
    this.relativeOffset = {top:c.top - b, left:c.left - a};
    this.btnWrapper && this.btnWrapper.attr({transform:"translate(" + (c.width / 2 - 65) + "," + (c.height - 200) + ")"});
  };
  b.generateButtons = function() {
    var a = this, b = this.svgGroup.elem("g");
    this.btnWrapper = b;
    var c = b.elem("text", {x:27, y:33, class:"entryFunctionButtonText"});
    c.textContent = Lang.Buttons.save;
    var e = b.elem("text", {x:102.5, y:33, class:"entryFunctionButtonText"});
    e.textContent = Lang.Buttons.cancel;
    var f = b.elem("circle", {cx:27.5, cy:27.5, r:27.5, class:"entryFunctionButton"}), b = b.elem("circle", {cx:102.5, cy:27.5, r:27.5, class:"entryFunctionButton"});
    $(f).bind("mousedown touchstart", function() {
      a.save();
    });
    $(c).bind("mousedown touchstart", function() {
      a.save();
    });
    $(b).bind("mousedown touchstart", function() {
      a.cancelEdit();
    });
    $(e).bind("mousedown touchstart", function() {
      a.cancelEdit();
    });
  };
  b.cancelEdit = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "cancelEdit");
  };
  b.save = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "save");
  };
  b.generateCodeMagnetMap = function() {
    var a = this.code, b = this.dragBlock;
    if (a && b) {
      this._magnetMap = {};
      for (var c in b.magnet) {
        if ("next" !== c || void 0 !== b.block.getLastBlock().view.magnet.next) {
          var e = this._getCodeBlocks(a, c);
          e.sort(function(a, b) {
            return a.point - b.point;
          });
          e.unshift({point:-Number.MAX_VALUE, blocks:[]});
          for (var f = 1;f < e.length;f++) {
            var g = e[f], h = g, k = g.startBlock;
            if (k) {
              for (var l = g.endPoint, m = f;l > h.point && (h.blocks.push(k), m++, h = e[m], h);) {
              }
              delete g.startBlock;
            }
            g.endPoint = Number.MAX_VALUE;
            e[f - 1].endPoint = g.point;
          }
          this._magnetMap[c] = e;
        }
      }
    }
  };
  b._getCodeBlocks = function(a, b) {
    var c = a.getThreads(), e = [], f;
    switch(b) {
      case "previous":
        f = this._getNextMagnets;
        break;
      case "next":
        f = this._getPreviousMagnets;
        break;
      case "string":
      ;
      case "boolean":
        f = this._getFieldMagnets;
        break;
      case "param":
        f = this._getOutputMagnets;
        break;
      default:
        return [];
    }
    for (var g = 0;g < c.length;g++) {
      var h = c[g], e = e.concat(f.call(this, h, h.view.zIndex, null, b))
    }
    return e;
  };
  b._getNextMagnets = function(a, b, c, e) {
    var f = a.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var m = f[l], n = m.view;
      n.zIndex = b;
      if (n.dragInstance) {
        break;
      }
      c += n.y;
      k += n.x;
      a = c + 1;
      n.magnet.next && (a += n.height, h.push({point:c, endPoint:a, startBlock:m, blocks:[]}), h.push({point:a, blocks:[]}), n.absX = k);
      m.statements && (b += .01);
      for (var q = 0;q < m.statements.length;q++) {
        a = m.statements[q];
        var r = m.view._statements[q];
        r.zIndex = b;
        r.absX = k + r.x;
        h.push({point:r.y + c - 30, endPoint:r.y + c, startBlock:r, blocks:[]});
        h.push({point:r.y + c + r.height, blocks:[]});
        b += .01;
        g = g.concat(this._getNextMagnets(a, b, {x:r.x + k, y:r.y + c}, e));
      }
      n.magnet.next && (c += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getPreviousMagnets = function(a, b, c, e) {
    var f = a.getBlocks();
    a = [];
    c || (c = {x:0, y:0});
    e = c.x;
    c = c.y;
    var f = f[0], g = f.view;
    g.zIndex = b;
    if (g.dragInstance) {
      return [];
    }
    c += g.y - 15;
    e += g.x;
    return g.magnet.previous ? (b = c + 1 + g.height, a.push({point:c, endPoint:b, startBlock:f, blocks:[]}), a.push({point:b, blocks:[]}), g.absX = e, a) : [];
  };
  b._getFieldMagnets = function(a, b, c, e) {
    var f = a.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var m = f[l], n = m.view;
      if (n.dragInstance) {
        break;
      }
      n.zIndex = b;
      c += n.y;
      k += n.x;
      h = h.concat(this._getFieldBlockMetaData(n, k, c, b, e));
      m.statements && (b += .01);
      for (var q = 0;q < m.statements.length;q++) {
        a = m.statements[q];
        var r = m.view._statements[q], g = g.concat(this._getFieldMagnets(a, b, {x:r.x + k, y:r.y + c}, e));
      }
      n.magnet.next && (c += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getFieldBlockMetaData = function(a, b, c, e, f) {
    var g = a._contents, h = [];
    c += a.contentPos.y;
    for (var k = 0;k < g.length;k++) {
      var l = g[k];
      if (l instanceof Entry.FieldBlock) {
        var m = l._valueBlock;
        if (!m.view.dragInstance && (l.acceptType === f || "boolean" === l.acceptType)) {
          var n = b + l.box.x, q = c + l.box.y + a.contentHeight % 1E3 * -.5, r = c + l.box.y + l.box.height;
          l.acceptType === f && (h.push({point:q, endPoint:r, startBlock:m, blocks:[]}), h.push({point:r, blocks:[]}));
          l = m.view;
          l.absX = n;
          l.zIndex = e;
          h = h.concat(this._getFieldBlockMetaData(l, n + l.contentPos.x, q + l.contentPos.y, e + .01, f));
        }
      }
    }
    return h;
  };
  b._getOutputMagnets = function(a, b, c, e) {
    var f = a.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var m = f[l], n = m.view;
      if (n.dragInstance) {
        break;
      }
      n.zIndex = b;
      c += n.y;
      k += n.x;
      h = h.concat(this._getOutputMetaData(n, k, c, b, e));
      m.statements && (b += .01);
      for (var q = 0;q < m.statements.length;q++) {
        a = m.statements[q];
        var r = m.view._statements[q], g = g.concat(this._getOutputMagnets(a, b, {x:r.x + k, y:r.y + c}, e));
      }
      n.magnet.next && (c += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getOutputMetaData = function(a, b, c, e, f) {
    var g = a._contents, h = [];
    b += a.contentPos.x;
    c += a.contentPos.y;
    for (a = 0;a < g.length;a++) {
      var k = g[a], l = b + k.box.x, m = c - 24, n = c;
      k instanceof Entry.FieldBlock ? (k.acceptType === f && (h.push({point:m, endPoint:n, startBlock:k, blocks:[]}), h.push({point:n, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20), (m = k._valueBlock) && (h = h.concat(this._getOutputMetaData(m.view, l, c + k.box.y, e + .01, f)))) : k instanceof Entry.FieldOutput && k.acceptType === f && (h.push({point:m, endPoint:n, startBlock:k, blocks:[]}), h.push({point:n, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20, (m = k._valueBlock) && (m.view.dragInstance || 
      (h = h.concat(this._getOutputMetaData(m.view, b + k.box.x, c + k.box.y, e + .01, f)))));
    }
    return h;
  };
  b.getNearestMagnet = function(a, b, c) {
    var e = this._magnetMap[c];
    if (e && 0 !== e.length) {
      var f = 0, g = e.length - 1, h, k = null, l = "previous" === c ? b - 15 : b;
      for (b = -1 < ["previous", "next"].indexOf(c) ? 20 : 0;f <= g;) {
        if (h = (f + g) / 2 | 0, c = e[h], l < c.point) {
          g = h - 1;
        } else {
          if (l > c.endPoint) {
            f = h + 1;
          } else {
            e = c.blocks;
            for (f = 0;f < e.length;f++) {
              if (g = e[f].view, g.absX - b < a && a < g.absX + g.width && (g = c.blocks[f], !k || k.view.zIndex < g.view.zIndex)) {
                k = c.blocks[f];
              }
            }
            return k;
          }
        }
      }
      return null;
    }
  };
  b.dominate = function(a) {
    a && (a = a.getFirstBlock()) && (this.svgBlockGroup.appendChild(a.view.svgGroup), this.code.dominate(a.thread));
  };
  b.enablePattern = function() {
    this.pattern.removeAttribute("style");
  };
  b.disablePattern = function() {
    this.pattern.attr({style:"display: none"});
  };
  b._removeActivated = function() {
    this._activatedBlockView && (this._activatedBlockView.removeActivated(), this._activatedBlockView = null);
  };
  b.activateBlock = function(a) {
    a = a.view;
    var b = a.getAbsoluteCoordinate(), c = this.svgDom, e = b.x, b = b.y, e = c.width() / 2 - e, c = c.height() / 2 - b - 100;
    this.scroller.scroll(e, c);
    a.addActivated();
    this._activatedBlockView = a;
  };
  b.reDraw = function() {
    this.code.view.reDraw();
  };
  b.separate = function(a, b) {
    "string" === typeof a && (a = this.findById(a));
    a.view && a.view._toGlobalCoordinate();
    var c = a.getPrevBlock();
    a.separate(b);
    c && c.getNextBlock() && c.getNextBlock().view.bindPrev();
  };
  b.insert = function(a, b, c) {
    "string" === typeof a && (a = this.findById(a));
    this.separate(a, c);
    3 === b.length ? a.moveTo(b[0], b[1]) : 4 === b.length && 0 === b[3] ? (b = this.code.getThreads()[b[2]], a.thread.cut(a), b.insertToTop(a), a.getNextBlock().view.bindPrev()) : (b = b instanceof Array ? this.code.getTargetByPointer(b) : b, b instanceof Entry.Block ? ("basic" === a.getBlockType() && a.view.bindPrev(b), a.doInsert(b)) : b instanceof Entry.FieldStatement ? (a.view.bindPrev(b), b.insertTopBlock(a)) : a.doInsert(b));
  };
  b.adjustThreadsPosition = function() {
    var a = this.code;
    a && (a = a.getThreads()) && 0 !== a.length && (a = a.sort(function(a, b) {
      return a.getFirstBlock().view.x - b.getFirstBlock().view.x;
    }), a = a[0].getFirstBlock()) && (a = a.view, a = a.getAbsoluteCoordinate(), this.scroller.scroll(50 - a.x, 30 - a.y));
  };
  b._initContextOptions = function() {
    var a = this;
    this._contextOptions = [{activated:!0, option:{text:Lang.Blocks.Paste_blocks, enable:!!Entry.clipboard, callback:function() {
      Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }}}, {activated:!0, option:{text:Lang.Blocks.tidy_up_block, callback:function() {
      a.alignThreads();
    }}}, {activated:!0, option:{text:Lang.Blocks.Clear_all_blocks, callback:function() {
      a.code.clear(!0);
    }}}, {activated:"workspace" === Entry.type && Entry.Utils.isChrome() && !Entry.isMobile(), option:{text:Lang.Menus.save_as_image_all, enable:!0, callback:function() {
      var b = a.code.getThreads(), c = [];
      b.forEach(function(a, f) {
        var g = a.getFirstBlock();
        g && (console.log("threads.length=", b.length), 1 < b.length && Entry.isOffline ? g.view.getDataUrl().then(function(a) {
          c.push(a);
          c.length == b.length && Entry.dispatchEvent("saveBlockImages", {images:c});
        }) : g.view.downloadAsImage(++f));
      });
    }}}];
  };
  b.activateContextOption = function(a) {
    this._contextOptions[a].activated = !0;
  };
  b.deActivateContextOption = function(a) {
    this._contextOptions[a].activated = !1;
  };
  b._bindEvent = function() {
    Entry.documentMousedown && (Entry.documentMousedown.attach(this, this.setSelectedBlock), Entry.documentMousedown.attach(this, this._removeActivated));
    Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
    if (Entry.windowResized) {
      var a = _.debounce(this.updateOffset, 200);
      Entry.windowResized.attach(this, a);
    }
  };
  b.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
  b._rightClick = function(a) {
    var b = Entry.disposeEvent;
    b && b.notify(a);
    if (this.visible) {
      var b = [], c = this._contextOptions;
      c[Entry.Board.OPTION_PASTE].option.enable = !!Entry.clipboard;
      c[Entry.Board.OPTION_DOWNLOAD].option.enable = 0 !== this.code.getThreads().length;
      for (var e = 0;e < this._contextOptions.length;e++) {
        c[e].activated && b.push(c[e].option);
      }
      a = Entry.Utils.convertMouseEvent(a);
      Entry.ContextMenu.show(b, null, {x:a.clientX, y:a.clientY});
    }
  };
})(Entry.Board.prototype);
Entry.skeleton = function() {
};
Entry.skeleton.basic = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, box:function(b) {
  return {offsetX:-8, offsetY:0, width:(b ? b.contentWidth : 150) + 30, height:Math.max(30, (b ? b.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(b) {
  return {previous:{x:0, y:0}, next:{x:0, y:(b ? Math.max(b.height, 30) : 30) + 1 + b.offsetY}};
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_create = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, box:function(b) {
  return {offsetX:-8, offsetY:0, width:(b ? b.contentWidth : 150) + 30, height:Math.max(30, (b ? b.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height, 30) : 30) + 1 + b.offsetY}};
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_event = {path:function(b) {
  b = b.contentWidth;
  b = Math.max(0, b);
  return "m -8,0 m 0,-5 a 19.5,19.5 0, 0,1 16,0 c 10,5 15,5 20,5 h %w a 15,15 0 0,1 0,30 H 8 l -8,8 -8,-8 l 0,0.5 a 19.5,19.5 0, 0,1 0,-35 z".replace(/%w/gi, b - 30);
}, box:function(b) {
  return {offsetX:-19, offsetY:-7, width:b.contentWidth + 30, height:30, marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height + b.offsetY + 7, 30) : 30) + 1}};
}, contentPos:function(b) {
  return {x:1, y:15};
}};
Entry.skeleton.basic_loop = {path:function(b) {
  var a = b.contentWidth, d = b.contentHeight, d = Math.max(30, d + 2), a = Math.max(0, a + 9 - d / 2);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh/gi, d).replace(/%w/gi, a).replace(/%bw/gi, a - 8).replace(/%h/gi, d / 2).replace(/%sh/gi, b + 1);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight + 2, 30), d = b._statements[0] ? b._statements[0].height : 20, d = Math.max(d, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:d + a + 18 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, d = Math.max(b.contentHeight + 2, 30);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 20);
  return {offsetX:-8, offsetY:0, width:a + 30, height:d + b + 17, marginBottom:0};
}, statementPos:function(b) {
  return [{x:16, y:Math.max(30, b.contentHeight + 2) + 1}];
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_define = {path:function(b) {
  var a = b.contentWidth, d = b.contentHeight, d = Math.max(30, d + 2), a = Math.max(0, a + 9 - d / 2);
  b = b._statements[0] ? b._statements[0].height : 30;
  b = Math.max(b, 20);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H -8 z".replace(/%wh/gi, d).replace(/%w/gi, a).replace(/%h/gi, d / 2).replace(/%bw/gi, a - 8).replace(/%sh/gi, b + 1);
}, magnets:function() {
  return {};
}, box:function(b) {
  return {offsetX:0, offsetY:0, width:b.contentWidth, height:Math.max(b.contentHeight, 25) + 46, marginBottom:0};
}, statementPos:function(b) {
  return [{x:16, y:Math.max(30, b.contentHeight + 2)}];
}, contentPos:function() {
  return {x:14, y:15};
}};
Entry.skeleton.pebble_event = {path:function(b) {
  return "m 0,0 a 25,25 0 0,1 9,48.3 a 9,9 0 0,1 -18,0 a 25,25 0 0,1 9,-48.3 z";
}, box:function(b) {
  return {offsetX:-25, offsetY:0, width:50, height:48.3, marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height, 49.3) : 49.3) + b.offsetY}};
}, contentPos:function() {
  return {x:0, y:25};
}};
Entry.skeleton.pebble_loop = {fontSize:16, dropdownHeight:23, path:function(b) {
  b = Math.max(b._statements[0] ? b._statements[0].height : 50, 50);
  return "M 0,9 a 9,9 0 0,0 9,-9 h %cw q 25,0 25,25 v %ch q 0,25 -25,25 h -%cw a 9,9 0 0,1 -18,0 h -%cw q -25,0 -25,-25 v -%ch q 0,-25 25,-25 h %cw a 9,9 0 0,0 9,9 M 0,49 a 9,9 0 0,1 -9,-9 h -28 a 25,25 0 0,0 -25,25 v %cih a 25,25 0 0,0 25,25 h 28 a 9,9 0 0,0 18,0 h 28 a 25,25 0 0,0 25,-25 v -%cih a 25,25 0 0,0 -25,-25 h -28 a 9,9 0 0,1 -9,9 z".replace(/%cw/gi, 41).replace(/%ch/gi, b + 4).replace(/%cih/gi, b - 50);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight + 2, 41), d = b._statements[0] ? b._statements[0].height : 20, d = Math.max(d, 51);
  return {previous:{x:0, y:0}, next:{x:0, y:d + a + 13 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, d = Math.max(b.contentHeight + 2, 41);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 51);
  return {offsetX:-(a / 2 + 13), offsetY:0, width:a + 30, height:d + b + 13, marginBottom:0};
}, statementPos:function(b) {
  return [{x:0, y:Math.max(39, b.contentHeight + 2) + 1.5}];
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.pebble_basic = {fontSize:15, morph:["prev", "next"], path:function(b) {
  return "m 0,9 a 9,9 0 0,0 9,-9 h 28 q 25,0 25,25q 0,25 -25,25h -28 a 9,9 0 0,1 -18,0 h -28 q -25,0 -25,-25q 0,-25 25,-25h 28 a 9,9 0 0,0 9,9 z";
}, magnets:function(b) {
  return {previous:{x:0, y:0}, next:{x:0, y:(b ? Math.max(b.height, 51) : 51) + b.offsetY}};
}, box:function() {
  return {offsetX:-62, offsetY:0, width:124, height:50, marginBottom:0};
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.basic_string_field = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(18, b + 2);
  a = Math.max(0, a - b + 12);
  return "m %h,0 h %w a %h,%h 0 1,1 0,%wh H %h A %h,%h 0 1,1 %h,0 z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, color:"#000", outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 12, height:Math.max((b ? b.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {string:{}};
}, contentPos:function(b) {
  return {x:6, y:Math.max(b.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_boolean_field = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(18, b + 2);
  a = Math.max(0, a - b + 19);
  return "m %h,0 h %w l %h,%h -%h,%h H %h l -%h,-%h %h,-%h z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, color:"#000", outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 19, height:Math.max((b ? b.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {boolean:{}};
}, contentPos:function(b) {
  return {x:10, y:Math.max(b.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_param = {path:function(b) {
  var a = b.contentWidth;
  (b = b._contents[b._contents.length - 1]) && (a -= b.box.width + Entry.BlockView.PARAM_SPACE - 2);
  a = Math.max(0, a);
  return "m 4,0 h 10 h %w l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2h -%w h -10 l -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2".replace(/%w/gi, a);
}, outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 11, height:24, marginBottom:0};
}, magnets:function() {
  return {param:{}};
}, contentPos:function(b) {
  return {x:11, y:12};
}};
Entry.skeleton.basic_button = {path:function() {
  return "m -64,0 h 128 a 6,6 0, 0,1 6,6 v 18 a 6,6 0, 0,1 -6,6 h -128 a 6,6 0, 0,1 -6,-6 v -18 a 6,6 0, 0,1 6,-6 z";
}, box:function() {
  return {offsetX:-80, offsetY:0, width:140, height:30};
}, contentPos:function() {
  return {x:0, y:15};
}, movable:!1, readOnly:!0, nextShadow:!0, classes:["basicButtonView"]};
Entry.skeleton.basic_without_next = {box:Entry.skeleton.basic.box, contentPos:Entry.skeleton.basic.contentPos, path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0, %wh H -8 z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, magnets:function(b) {
  return {previous:{x:0, y:0}};
}};
Entry.skeleton.basic_double_loop = {path:function(b) {
  var a = b.contentWidth, d = b.contentHeight % 1E6, c = Math.floor(b.contentHeight / 1E6), d = Math.max(30, d + 2), c = Math.max(30, c + 2), a = Math.max(0, a + 5 - d / 2), e = b._statements;
  b = e[0] ? e[0].height : 20;
  e = e[1] ? e[1].height : 20;
  b = Math.max(b, 20);
  e = Math.max(e, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h1,%h1 0 0,1 0,%wh1 H 24 l -8,8 -8,-8 h -0.4 v %sh1 h 0.4 l 8,8 8,-8 h %bw a %h2,%h2 0 0,1 0,%wh2 H 24 l -8,8 -8,-8 h -0.4 v %sh2 h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh1/gi, d).replace(/%wh2/gi, c).replace(/%w/gi, a).replace(/%bw/gi, a - 8).replace(/%h1/gi, d / 2).replace(/%h2/gi, c / 2).replace(/%sh1/gi, b + 1).replace(/%sh2/gi, e + 1);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight % 1E6 + 2, 30), d = Math.max(Math.floor(b.contentHeight / 1E6) + 2, 30), c = b._statements[0] ? b._statements[0].height : 20, e = b._statements[1] ? b._statements[1].height : 20, c = Math.max(c, 20), e = Math.max(e, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:c + e + a + d + 19 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, d = Math.max(Math.floor(b.contentHeight / 1E6) + 2, 30), c = Math.max(b.contentHeight % 1E6 + 2, 30), e = b._statements[0] ? b._statements[0].height % 1E6 : 20;
  b = b._statements[1] ? b._statements[1].height : 20;
  e = Math.max(e, 20);
  b = Math.max(b, 20);
  return {offsetX:-8, offsetY:0, width:a + 30, height:d + c + e + b + 17, marginBottom:0};
}, statementPos:function(b) {
  var a = Math.max(30, b.contentHeight % 1E6 + 2) + 1;
  return [{x:16, y:a}, {x:16, y:a + Math.max(b._statements[0] ? b._statements[0].height % 1E6 : 20, 20) + Math.max(Math.floor(b.contentHeight / 1E6) + 2, 30) + 1}];
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight % 1E6, 28) / 2 + 1};
}};
Entry.skinContainer = {_skins:{}};
(function(b) {
  b.skinSchema = {type:"", condition:[]};
  b.loadSkins = function(a) {
    a.map(this.addSkin.bind(this));
  };
  b.addSkin = function(a) {
    var b = function() {
    };
    b.prototype = Entry.block[a.type];
    var b = new b, c;
    for (c in a) {
      b[c] = a[c];
    }
    this._skins[a.type] || (this._skins[a.type] = []);
    this._skins[a.type].push(b);
  };
  b.getSkin = function(a) {
    if (this._skins[a.type]) {
      for (var b = this._skins[a.type], c = 0;c < b.length;c++) {
        var e = b[c];
        if (!e.conditions || !e.conditions.length) {
          return e;
        }
        for (var f = 0;f < e.conditions.length;f++) {
          var g = e.conditions[f];
          if (a.getDataByPointer(g.pointer) !== g.value) {
            break;
          }
          if (f === e.conditions.length - 1) {
            return e;
          }
        }
      }
    }
    return Entry.block[a.type];
  };
})(Entry.skinContainer);
Entry.Thread = function(b, a, d) {
  this._data = new Entry.Collection;
  this._code = a;
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this.handleChange);
  this._event = null;
  this.parent = d ? d : a;
  this.load(b);
};
(function(b) {
  b.load = function(a, b) {
    void 0 === a && (a = []);
    if (!(a instanceof Array)) {
      return console.error("thread must be array");
    }
    for (var c = 0;c < a.length;c++) {
      var e = a[c];
      e instanceof Entry.Block || e.isDummy ? (e.setThread(this), this._data.push(e)) : this._data.push(new Entry.Block(e, this));
    }
    (c = this._code.view) && this.createView(c.board, b);
  };
  b.registerEvent = function(a, b) {
    this._event = b;
    this._code.registerEvent(a, b);
  };
  b.unregisterEvent = function(a, b) {
    this._code.unregisterEvent(a, b);
  };
  b.createView = function(a, b) {
    this.view || (this.view = new Entry.ThreadView(this, a));
    this._data.getAll().forEach(function(c) {
      c.createView(a, b);
    });
  };
  b.destroyView = function() {
    this.view = null;
    this._data.map(function(a) {
      a.destroyView();
    });
  };
  b.separate = function(a, b) {
    if (this._data.has(a.id)) {
      var c = this._data.splice(this._data.indexOf(a), b);
      this._code.createThread(c);
      this.changeEvent.notify();
    }
  };
  b.cut = function(a) {
    a = this._data.indexOf(a);
    a = this._data.splice(a);
    this.changeEvent.notify();
    return a;
  };
  b.insertByBlock = function(a, b) {
    for (var c = a ? this._data.indexOf(a) : -1, e = 0;e < b.length;e++) {
      b[e].setThread(this);
    }
    this._data.splice.apply(this._data, [c + 1, 0].concat(b));
    this.changeEvent.notify();
  };
  b.insertToTop = function(a) {
    a.setThread(this);
    this._data.unshift.apply(this._data, [a]);
    this.changeEvent.notify();
  };
  b.clone = function(a, b) {
    a = a || this._code;
    for (var c = new Entry.Thread([], a), e = this._data, f = [], g = 0, h = e.length;g < h;g++) {
      f.push(e[g].clone(c));
    }
    c.load(f, b);
    return c;
  };
  b.toJSON = function(a, b, c) {
    var e = [];
    for (b = void 0 === b ? 0 : b;b < this._data.length;b++) {
      this._data[b] instanceof Entry.Block && e.push(this._data[b].toJSON(a, c));
    }
    return e;
  };
  b.destroy = function(a, b) {
    this.view && this.view.destroy(a);
    for (var c = this._data, e = c.length - 1;0 <= e;e--) {
      c[e].destroy(a, null, b);
    }
    !c.length && this._code.destroyThread(this, !1);
  };
  b.getBlock = function(a) {
    return this._data[a];
  };
  b.getBlocks = function() {
    return this._data.map(function(a) {
      return a;
    });
  };
  b.countBlock = function() {
    for (var a = 0, b = 0;b < this._data.length;b++) {
      var c = this._data[b];
      if (c.type && (a++, c = c.statements)) {
        for (var e = 0;e < c.length;e++) {
          a += c[e].countBlock();
        }
      }
    }
    return a;
  };
  b.handleChange = function() {
    0 === this._data.length && this.destroy();
  };
  b.getCode = function() {
    return this._code;
  };
  b.setCode = function(a) {
    this._code = a;
  };
  b.spliceBlock = function(a) {
    this._data.remove(a);
    this.changeEvent.notify();
  };
  b.getFirstBlock = function() {
    return this._data[0];
  };
  b.getPrevBlock = function(a) {
    a = this._data.indexOf(a);
    return this._data.at(a - 1);
  };
  b.getNextBlock = function(a) {
    a = this._data.indexOf(a);
    return this._data.at(a + 1);
  };
  b.getLastBlock = function() {
    return this._data.at(this._data.length - 1);
  };
  b.getRootBlock = function() {
    return this._data.at(0);
  };
  b.hasBlockType = function(a) {
    function b(c) {
      if (a == c.type) {
        return !0;
      }
      for (var f = c.params, g = 0;g < f.length;g++) {
        var h = f[g];
        if (h && h.constructor == Entry.Block && b(h)) {
          return !0;
        }
      }
      if (c = c.statements) {
        for (f = 0;f < c.length;f++) {
          if (c[f].hasBlockType(a)) {
            return !0;
          }
        }
      }
      return !1;
    }
    for (var c = 0;c < this._data.length;c++) {
      if (b(this._data[c])) {
        return !0;
      }
    }
    return !1;
  };
  b.getCount = function(a) {
    var b = this._data.length;
    a && (b -= this._data.indexOf(a));
    return b;
  };
  b.indexOf = function(a) {
    return this._data.indexOf(a);
  };
  b.pointer = function(a, b) {
    var c = this.indexOf(b);
    a.unshift(c);
    this.parent instanceof Entry.Block && a.unshift(this.parent.indexOfStatements(this));
    return this._code === this.parent ? (1 === this._data.length && a.shift(), a.unshift(this._code.indexOf(this)), c = this._data[0], a.unshift(c.y), a.unshift(c.x), a) : this.parent.pointer(a);
  };
  b.getBlockList = function(a, b) {
    for (var c = [], e = 0;e < this._data.length;e++) {
      var f = this._data[e];
      f.constructor === Entry.Block && (c = c.concat(f.getBlockList(a, b)));
    }
    return c;
  };
  b.stringify = function(a) {
    return JSON.stringify(this.toJSON(void 0, void 0, a));
  };
})(Entry.Thread.prototype);
Entry.Block = function(b, a) {
  var d = this;
  Entry.Model(this, !1);
  this._schema = null;
  this.setThread(a);
  this.load(b);
  var c = this.getCode();
  c.registerBlock(this);
  var e = this.events.dataAdd;
  e && c.object && e.forEach(function(a) {
    Entry.Utils.isFunction(a) && a(d);
  });
};
Entry.Block.MAGNET_RANGE = 10;
Entry.Block.MAGNET_OFFSET = .4;
Entry.Block.DELETABLE_TRUE = 1;
Entry.Block.DELETABLE_FALSE = 2;
Entry.Block.DELETABLE_FALSE_LIGHTEN = 3;
(function(b) {
  b.schema = {id:null, x:0, y:0, type:null, params:[], statements:[], view:null, thread:null, movable:null, deletable:Entry.Block.DELETABLE_TRUE, readOnly:null, copyable:!0, events:{}, extensions:[]};
  b.load = function(a) {
    a.id || (a.id = Entry.Utils.generateId());
    this.set(a);
    this.loadSchema();
  };
  b.changeSchema = function(a) {
    this.set({params:[]});
    this.loadSchema();
  };
  b.getSchema = function() {
    this._schema || this.loadSchema();
    return this._schema;
  };
  b.loadSchema = function() {
    if (this._schema = Entry.block[this.type]) {
      !this._schemaChangeEvent && this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this.changeSchema));
      var a = this._schema.events;
      if (a) {
        for (var b in a) {
          this.events[b] || (this.events[b] = []);
          for (var c = a[b], e = 0;e < c.length;e++) {
            var f = c[e];
            f && 0 > this.events[b].indexOf(f) && this.events[b].push(f);
          }
        }
      }
      this._schema.event && this.thread.registerEvent(this, this._schema.event);
      a = this.params;
      b = this._schema.params;
      for (e = 0;b && e < b.length;e++) {
        c = void 0 === a[e] || null === a[e] ? b[e].value : a[e], f = a[e] || e < a.length, !c || "Output" !== b[e].type && "Block" !== b[e].type || (c = new Entry.Block(c, this.thread)), f ? a.splice(e, 1, c) : a.push(c);
      }
      if (a = this._schema.statements) {
        for (e = 0;e < a.length;e++) {
          this.statements.splice(e, 1, new Entry.Thread(this.statements[e], this.getCode(), this));
        }
      }
    }
  };
  b.changeType = function(a) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this.set({type:a});
    this.loadSchema();
    this.view && this.view.changeType(a);
  };
  b.setThread = function(a) {
    this.set({thread:a});
  };
  b.getThread = function() {
    return this.thread;
  };
  b.insertAfter = function(a) {
    this.thread.insertByBlock(this, a);
  };
  b._updatePos = function() {
    this.view && this.set({x:this.view.x, y:this.view.y});
  };
  b.moveTo = function(a, b) {
    this.view && this.view._moveTo(a, b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.createView = function(a, b) {
    this.view || (this.set({view:new Entry.BlockView(this, a, b)}), this._updatePos());
  };
  b.destroyView = function() {
    this.view.destroy();
    this.set({view:null});
  };
  b.clone = function(a) {
    return new Entry.Block(this.toJSON(!0), a);
  };
  b.toJSON = function(a, b) {
    var c = this._toJSON();
    delete c.view;
    delete c.thread;
    delete c.events;
    a && delete c.id;
    c.params = c.params.map(function(c) {
      c instanceof Entry.Block && (c = c.toJSON(a, b));
      return c;
    });
    c.statements = c.statements.map(function(c) {
      return c.toJSON(a, void 0, b);
    });
    c.x = this.x;
    c.y = this.y;
    c.movable = this.movable;
    c.deletable = this.deletable;
    c.readOnly = this.readOnly;
    b && b instanceof Array && b.forEach(function(a) {
      delete c[a];
    });
    return c;
  };
  b.destroy = function(a, b, c) {
    if (!c || this.deletable === Entry.Block.DELETABLE_TRUE) {
      var e = this, f = this.params;
      if (f) {
        for (c = 0;c < f.length;c++) {
          var g = f[c];
          g instanceof Entry.Block && (g.doNotSplice = !0, g.destroy(a));
        }
      }
      if (f = this.statements) {
        for (c = 0;c < f.length;c++) {
          f[c].destroy(a);
        }
      }
      g = this.getPrevBlock();
      c = this.getNextBlock();
      this.getCode().unregisterBlock(this);
      f = this.getThread();
      this._schema && this._schema.event && f.unregisterEvent(this, this._schema.event);
      c && (b ? c.destroy(a, b) : g ? c.view && c.view.bindPrev(g, !0) : (b = this.getThread().view.getParent(), b.constructor === Entry.FieldStatement ? (c.view && c.view.bindPrev(b), b.insertTopBlock(c)) : b.constructor === Entry.FieldStatement ? c.replace(b._valueBlock) : c.view._toGlobalCoordinate()));
      !this.doNotSplice && f.spliceBlock ? f.spliceBlock(this) : delete this.doNotSplice;
      this.view && this.view.destroy(a);
      this._schemaChangeEvent && this._schemaChangeEvent.destroy();
      (a = this.events.dataDestroy) && this.getCode().object && a.forEach(function(a) {
        Entry.Utils.isFunction(a) && a(e);
      });
    }
  };
  b.getView = function() {
    return this.view;
  };
  b.setMovable = function(a) {
    this.movable != a && this.set({movable:a});
  };
  b.setCopyable = function(a) {
    this.copyable != a && this.set({copyable:a});
  };
  b.isMovable = function() {
    return this.movable;
  };
  b.isCopyable = function() {
    return this.copyable;
  };
  b.setDeletable = function(a) {
    this.deletable != a && this.set({deletable:a});
  };
  b.isDeletable = function() {
    return this.deletable === Entry.Block.DELETABLE_TRUE;
  };
  b.isReadOnly = function() {
    return this.readOnly;
  };
  b.getCode = function() {
    return this.thread.getCode();
  };
  b.doAdd = function() {
    this.getCode().changeEvent.notify();
  };
  b.doMove = function() {
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.doSeparate = function() {
    this.separate();
  };
  b.doInsert = function(a) {
    "basic" === this.getBlockType() ? this.insert(a) : this.replace(a);
  };
  b.doDestroy = function(a) {
    this.destroy(a);
    this.getCode().changeEvent.notify();
    return this;
  };
  b.doDestroyBelow = function(a) {
    console.log("destroyBelow", this.id, this.x, this.y);
    this.destroy(a, !0);
    this.getCode().changeEvent.notify();
    return this;
  };
  b.copy = function() {
    var a = this.getThread(), b = [];
    if (a instanceof Entry.Thread) {
      for (var c = a.getBlocks().indexOf(this), a = a.toJSON(!0, c), c = 0;c < a.length;c++) {
        b.push(a[c]);
      }
    } else {
      b.push(this.toJSON(!0));
    }
    a = this.view.getAbsoluteCoordinate();
    c = b[0];
    c.x = a.x + 15;
    c.y = a.y + 15;
    c.id = Entry.Utils.generateId();
    return b;
  };
  b.copyToClipboard = function() {
    Entry.clipboard = this.copy();
  };
  b.separate = function(a) {
    this.thread.separate(this, a);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.insert = function(a) {
    var b = this.thread.cut(this);
    a instanceof Entry.Thread ? a.insertByBlock(null, b) : a.insertAfter(b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.replace = function(a) {
    this.thread.cut(this);
    a.getThread().replace(this);
    this.getCode().changeEvent.notify();
  };
  b.getPrevBlock = function() {
    return this.thread.getPrevBlock(this);
  };
  b.getNextBlock = function() {
    return this.thread.getNextBlock(this) || null;
  };
  b.getLastBlock = function() {
    return this.thread.getLastBlock();
  };
  b.getOutputBlock = function() {
    for (var a = this._schema.params, b = 0;a && b < a.length;b++) {
      if ("Output" === a[b].type) {
        return this.params[b];
      }
    }
    return null;
  };
  b.getTerminateOutputBlock = function() {
    for (var a = this;;) {
      var b = a.getOutputBlock();
      if (!b) {
        return a;
      }
      a = b;
    }
  };
  b.getBlockType = function() {
    if (!this.view) {
      return null;
    }
    var a = Entry.skeleton[this._schema.skeleton].magnets(this.view);
    return a.next || a.previous ? "basic" : a.boolean || a.string ? "field" : a.output ? "output" : null;
  };
  b.indexOfStatements = function(a) {
    return this.statements.indexOf(a);
  };
  b.pointer = function(a) {
    a || (a = []);
    return this.thread.pointer(a, this);
  };
  b.targetPointer = function() {
    var a = this.thread.pointer([], this);
    4 === a.length && 0 === a[3] && a.pop();
    return a;
  };
  b.getDataByPointer = function(a) {
    a = a.concat();
    var b = this.params[a.shift()];
    return a.length ? b.getDataByPointer ? b.getDataByPointer(a) : null : b;
  };
  b.getBlockList = function(a, b) {
    var c = [];
    if (!this._schema) {
      return [];
    }
    if (a && this._schema.isPrimitive) {
      return c;
    }
    (b || this.type) === this.type && c.push(this);
    for (var e = this.params, f = 0;f < e.length;f++) {
      var g = e[f];
      g && g.constructor == Entry.Block && (c = c.concat(g.getBlockList(a, b)));
    }
    if (e = this.statements) {
      for (f = 0;f < e.length;f++) {
        g = e[f], g.constructor === Entry.Thread && (c = c.concat(g.getBlockList(a, b)));
      }
    }
    return c;
  };
  b.stringify = function(a) {
    return JSON.stringify(this.toJSON(!1, a));
  };
})(Entry.Block.prototype);
Entry.ThreadView = function(b, a) {
  Entry.Model(this, !1);
  this.thread = b;
  this.svgGroup = a.svgThreadGroup.elem("g");
  this.parent = a;
  this._hasGuide = !1;
};
(function(b) {
  b.schema = {height:0, zIndex:0};
  b.destroy = function() {
    this.svgGroup.remove();
  };
  b.setParent = function(a) {
    this.parent = a;
  };
  b.getParent = function() {
    return this.parent;
  };
  b.renderText = function() {
    for (var a = this.thread.getBlocks(), b = 0;b < a.length;b++) {
      a[b].view.renderText();
    }
  };
  b.renderBlock = function() {
    for (var a = this.thread.getBlocks(), b = 0;b < a.length;b++) {
      a[b].view.renderBlock();
    }
  };
  b.requestAbsoluteCoordinate = function(a) {
    var b = this.thread.getBlocks(), c = b.shift(), e = {x:0, y:0};
    for (this.parent instanceof Entry.Board || this.parent instanceof Entry.BlockMenu || (e = this.parent.requestAbsoluteCoordinate());c && c.view !== a && c.view;) {
      c = c.view, e.x += c.x + c.magnet.next.x, e.y += c.y + c.magnet.next.y, c = b.shift();
    }
    return e;
  };
  b.requestPartHeight = function(a, b) {
    for (var c = this.thread.getBlocks(), e = c.pop(), f = a ? a.magnet.next ? a.magnet.next.y : a.height : 0;e && e.view !== a && e.view;) {
      e = e.view, f = e.magnet.next ? f + e.magnet.next.y : f + e.height, e.dragMode === Entry.DRAG_MODE_DRAG && (f = 0), e = c.pop();
    }
    return f;
  };
  b.dominate = function() {
    !this._hasGuide && this.parent.dominate(this.thread);
  };
  b.isGlobal = function() {
    return this.parent instanceof Entry.Board;
  };
  b.reDraw = function() {
    for (var a = this.thread._data, b = a.length - 1;0 <= b;b--) {
      a[b].view.reDraw();
    }
  };
  b.setZIndex = function(a) {
    this.set({zIndex:a});
  };
  b.setHasGuide = function(a) {
    this._hasGuide = a;
  };
})(Entry.ThreadView.prototype);
Entry.FieldTrashcan = function(b) {
  b && this.setBoard(b);
  this.dragBlockObserver = this.dragBlock = null;
  this.isOver = !1;
  Entry.windowResized && Entry.windowResized.attach(this, this.setPosition);
};
(function(b) {
  b._generateView = function() {
    this.svgGroup = this.board.svg.elem("g");
    this.renderStart();
    this._addControl();
  };
  b.renderStart = function() {
    var a = Entry.mediaFilePath + "delete_";
    this.trashcanTop = this.svgGroup.elem("image", {href:a + "cover.png", width:60, height:20});
    this.svgGroup.elem("image", {href:a + "body.png", y:20, width:60, height:60});
  };
  b._addControl = function() {
    $(this.svgGroup).bind("mousedown", function(a) {
      Entry.Utils.isRightButton(a) && (a.stopPropagation(), $("#entryWorkspaceBoard").css("background", "white"));
    });
  };
  b.updateDragBlock = function() {
    var a = this.board.dragBlock, b = this.dragBlockObserver;
    b && (b.destroy(), this.dragBlockObserver = null);
    a ? this.dragBlockObserver = a.observe(this, "checkBlock", ["x", "y"]) : (this.isOver && this.dragBlock && !this.dragBlock.block.getPrevBlock() && (this.dragBlock.block.doDestroyBelow(!0), createjs.Sound.play("entryDelete")), this.tAnimation(!1));
    this.dragBlock = a;
  };
  b.checkBlock = function() {
    var a = this.dragBlock;
    if (a && a.block.isDeletable()) {
      var b = this.board.offset(), c = this.getPosition(), e = c.x + b.left, b = c.y + b.top, f, g;
      if (a = a.dragInstance) {
        f = a.offsetX, g = a.offsetY;
      }
      this.tAnimation(f >= e && g >= b);
    }
  };
  b.align = function() {
    var a = this.getPosition();
    this.svgGroup.attr({transform:"translate(" + a.x + "," + a.y + ")"});
  };
  b.setPosition = function() {
    if (this.board) {
      var a = this.board.svgDom;
      this._x = a.width() - 110;
      this._y = a.height() - 110;
      this.align();
    }
  };
  b.getPosition = function() {
    return {x:this._x, y:this._y};
  };
  b.tAnimation = function(a) {
    if (a !== this.isOver) {
      a = void 0 === a ? !0 : a;
      var b, c = this.trashcanTop;
      b = a ? {translateX:15, translateY:-25, rotateZ:30} : {translateX:0, translateY:0, rotateZ:0};
      $(c).velocity(b, {duration:50});
      this.isOver = a;
    }
  };
  b.setBoard = function(a) {
    this._dragBlockObserver && this._dragBlockObserver.destroy();
    this.board = a;
    this.svgGroup || this._generateView();
    var b = a.svg, c = b.firstChild;
    c ? b.insertBefore(this.svgGroup, c) : b.appendChild(this.svgGroup);
    this._dragBlockObserver = a.observe(this, "updateDragBlock", ["dragBlock"]);
    this.svgGroup.attr({filter:"url(#entryTrashcanFilter_" + a.suffix + ")"});
    this.setPosition();
  };
})(Entry.FieldTrashcan.prototype);
Entry.Vim = function(b, a) {
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.createDom(b);
  this._mode = Entry.Vim.WORKSPACE_MODE;
  this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY;
  this._parser = new Entry.Parser(this._mode, this._parserType, this.codeMirror);
  Entry.Model(this, !1);
  window.eventset = [];
};
Entry.Vim.MAZE_MODE = 1;
Entry.Vim.WORKSPACE_MODE = 2;
Entry.Vim.TEXT_TYPE_JS = 0;
Entry.Vim.TEXT_TYPE_PY = 1;
Entry.Vim.PARSER_TYPE_JS_TO_BLOCK = 0;
Entry.Vim.PARSER_TYPE_PY_TO_BLOCK = 1;
Entry.Vim.PARSER_TYPE_BLOCK_TO_JS = 2;
Entry.Vim.PARSER_TYPE_BLOCK_TO_PY = 3;
Entry.Vim.PYTHON_IMPORT_ENTRY = "import Entry";
Entry.Vim.PYTHON_IMPORT_HW = "import Arduino, Hamster, Albert, Bitbrick, Codeino, Dplay \n\t   Neobot, Nemoino, Robotis, Sensorboard, Xbot from Hw";
(function(b) {
  b.createDom = function(a) {
    function b(a) {
      var c = e.getCodeToText(a.block);
      e.codeMirror.display.dragFunctions.leave(a);
      var d = Entry.Utils.createMouseEvent("mousedown", a);
      e.codeMirror.display.scroller.dispatchEvent(d);
      var c = c.split("\n"), k = c.length - 1, l = 0;
      c.forEach(function(a, b) {
        e.codeMirror.replaceSelection(a);
        l = e.doc.getCursor().line;
        e.codeMirror.indentLine(l);
        0 !== b && k === b || e.codeMirror.replaceSelection("\n");
      });
      a = Entry.Utils.createMouseEvent("mouseup", a);
      e.codeMirror.display.scroller.dispatchEvent(a);
    }
    function c(a) {
      e.codeMirror.display.dragFunctions.over(a);
    }
    var e;
    this.view = Entry.Dom("div", {parent:a, class:"entryVimBoard"});
    this.codeMirror = CodeMirror(this.view[0], {lineNumbers:!0, value:"", mode:{name:"javascript", globalVars:!0}, theme:"default", indentUnit:4, indentWithTabs:!0, styleActiveLine:!0, extraKeys:{"Ctrl-Space":"autocomplete"}, lint:!0, viewportMargin:10});
    this.doc = this.codeMirror.getDoc();
    e = this;
    a = this.view[0];
    a.removeEventListener("dragEnd", b);
    a.removeEventListener("dragOver", c);
    a.addEventListener("dragEnd", b);
    a.addEventListener("dragOver", c);
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.textToCode = function(a) {
    a === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : a === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    a = this.codeMirror.getValue();
    return this._parser.parse(a);
  };
  b.codeToText = function(a, b) {
    var c;
    b && (this._mode = b.runType);
    Entry.playground && (c = Entry.playground.object, c = "# " + c.name + " \uc624\ube0c\uc81d\ud2b8\uc758 \ud30c\uc774\uc36c \ucf54\ub4dc");
    var e = b.textType;
    e === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : e === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    var f = this._parser.parse(a, Entry.Parser.PARSE_GENERAL);
    e === Entry.Vim.TEXT_TYPE_PY && (f = c.concat("\n\n").concat(Entry.Vim.PYTHON_IMPORT_ENTRY).concat("\n\n").concat(f));
    this.codeMirror.setValue(f + "\n");
    e == Entry.Vim.TEXT_TYPE_PY && this.codeMirror.getDoc().markText({line:0, ch:0}, {line:4, ch:0}, {readOnly:!0});
    c = this.codeMirror.getDoc();
    c.setCursor({line:c.lastLine() - 1});
  };
  b.getCodeToText = function(a) {
    var b = this.workspace.oldTextType;
    b === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : b === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    return this._parser.parse(a, Entry.Parser.PARSE_SYNTAX);
  };
  b.setParserAvailableCode = function(a, b) {
    this._parser.setAvailableCode(a, b);
  };
})(Entry.Vim.prototype);
Entry.Workspace = function(b) {
  Entry.Model(this, !1);
  this.observe(this, "_handleChangeBoard", ["selectedBoard"], !1);
  this.trashcan = new Entry.FieldTrashcan;
  var a = b.blockMenu;
  a && (this.blockMenu = new Entry.BlockMenu(a.dom, a.align, a.categoryData, a.scroll), this.blockMenu.workspace = this, this.blockMenu.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1));
  if (a = b.board) {
    a.workspace = this, this.board = new Entry.Board(a), this.board.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1), this.set({selectedBoard:this.board});
  }
  if (a = b.vimBoard) {
    this.vimBoard = new Entry.Vim(a.dom), this.vimBoard.workspace = this;
  }
  this.board && this.vimBoard && this.vimBoard.hide();
  Entry.GlobalSvg.createDom();
  this.mode = Entry.Workspace.MODE_BOARD;
  Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
  this.changeEvent = new Entry.Event(this);
  Entry.commander.setCurrentEditor("board", this.board);
  this.textType = void 0 !== b.textType ? b.textType : Entry.Vim.TEXT_TYPE_PY;
};
Entry.Workspace.MODE_BOARD = 0;
Entry.Workspace.MODE_VIMBOARD = 1;
Entry.Workspace.MODE_OVERLAYBOARD = 2;
(function(b) {
  b.schema = {selectedBlockView:null, selectedBoard:null};
  b.getBoard = function() {
    return this.board;
  };
  b.getSelectedBoard = function() {
    return this.selectedBoard;
  };
  b.getBlockMenu = function() {
    return this.blockMenu;
  };
  b.getVimBoard = function() {
    return this.vimBoard;
  };
  b.getMode = function() {
    return this.mode;
  };
  b.setMode = function(a, b) {
    isNaN(a) ? (this.mode = a.boardType, this.runType = a.runType, this.textType = a.textType) : this.mode = a;
    this.mode = Number(this.mode);
    switch(this.mode) {
      case this.oldMode:
        return;
      case Entry.Workspace.MODE_VIMBOARD:
        try {
          this.board && this.board.hide(), this.overlayBoard && this.overlayBoard.hide(), this.set({selectedBoard:this.vimBoard}), this.vimBoard.show(), this.codeToText(this.board.code, a), this.blockMenu.renderText(function() {
            this.blockMenu.reDraw();
          }.bind(this)), this.board.clear(), this.oldTextType = this.textType;
        } catch (c) {
        }
        break;
      case Entry.Workspace.MODE_BOARD:
        try {
          this.board.show(), this.set({selectedBoard:this.board}), this.vimBoard && (this.textToCode(this.oldMode, this.oldTextType), this.vimBoard.hide()), this.overlayBoard && this.overlayBoard.hide(), this.oldMode === Entry.Workspace.MODE_VIMBOARD && this.blockMenu.renderBlock(function() {
            this.blockMenu.reDraw();
          }.bind(this)), this.oldTextType = this.textType;
        } catch (c) {
          this.board && this.board.hide(), this.set({selectedBoard:this.vimBoard}), this.mode = Entry.Workspace.MODE_VIMBOARD, this.oldTextType == Entry.Vim.PARSER_TYPE_JS_TO_BLOCK ? (a.boardType = Entry.Workspace.MODE_VIMBOARD, a.textType = Entry.Vim.TEXT_TYPE_JS, a.runType = Entry.Vim.MAZE_MODE, this.oldTextType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK, Entry.dispatchEvent("changeMode", a), Ntry.dispatchEvent("textError", a)) : this.oldTextType == Entry.Vim.PARSER_TYPE_PY_TO_BLOCK && (a.boardType = 
          Entry.Workspace.MODE_VIMBOARD, a.textType = Entry.Vim.TEXT_TYPE_PY, a.runType = Entry.Vim.WORKSPACE_MODE, this.oldTextType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK, Entry.dispatchEvent("changeMode", a));
        }
        Entry.commander.setCurrentEditor("board", this.board);
        break;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        this.overlayBoard || this.initOverlayBoard(), this.overlayBoard.show(), this.set({selectedBoard:this.overlayBoard}), Entry.commander.setCurrentEditor("board", this.overlayBoard);
    }
    this.oldMode = this.mode;
    this.changeEvent.notify(b);
  };
  b.changeBoardCode = function(a) {
    this._syncTextCode();
    this.board.changeCode(a);
    this.mode === Entry.Workspace.MODE_VIMBOARD && this.codeToText(this.board.code);
  };
  b.changeOverlayBoardCode = function(a) {
    this.overlayBoard && this.overlayBoard.changeCode(a);
  };
  b.changeBlockMenuCode = function(a) {
    this.blockMenu.changeCode(a);
  };
  b.textToCode = function(a, b) {
    if (a == Entry.Workspace.MODE_VIMBOARD) {
      var c = this, e = this.vimBoard.textToCode(b), f = this.board, g = f.code;
      g.load(e);
      g.createView(f);
      this.board.reDraw();
      setTimeout(function() {
        c.board.alignThreads();
      }, 0);
    }
  };
  b.codeToText = function(a, b) {
    if (this.vimBoard) {
      return this.vimBoard.codeToText(a, b);
    }
  };
  b.getCodeToText = function(a) {
    if (this.vimBoard) {
      return this.vimBoard.getCodeToText(a);
    }
  };
  b._setSelectedBlockView = function() {
    this.set({selectedBlockView:this.board.selectedBlockView || this.blockMenu.selectedBlockView || (this.overlayBoard ? this.overlayBoard.selectedBlockView : null)});
  };
  b.initOverlayBoard = function() {
    this.overlayBoard = new Entry.Board({dom:this.board.view, workspace:this, isOverlay:!0});
    this.overlayBoard.changeCode(new Entry.Code([]));
    this.overlayBoard.workspace = this;
    this.overlayBoard.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1);
  };
  b._keyboardControl = function(a) {
    var b = a.keyCode || a.which, c = a.ctrlKey;
    if (!Entry.Utils.isInInput(a)) {
      var e = this.selectedBlockView;
      e && !e.isInBlockMenu && e.block.isDeletable() && (8 == b || 46 == b ? (Entry.do("destroyBlock", e.block), a.preventDefault()) : c && (67 == b ? e.block.copyToClipboard() : 88 == b && (a = e.block, a.copyToClipboard(), a.destroy(!0, !0), e.getBoard().setSelectedBlock(null))));
      c && 86 == b && (b = this.selectedBoard) && b instanceof Entry.Board && Entry.clipboard && Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }
  };
  b._handleChangeBoard = function() {
    var a = this.selectedBoard;
    a && a.constructor === Entry.Board && this.trashcan.setBoard(a);
  };
  b._syncTextCode = function() {
    if (this.mode === Entry.Workspace.MODE_VIMBOARD) {
      var a = this.vimBoard.textToCode(this.textType), b = this.board, c = b.code;
      c.load(a);
      c.createView(b);
      this.board.alignThreads();
    }
  };
  b.addVimBoard = function(a) {
    this.vimBoard || (this.vimBoard = new Entry.Vim(a), this.vimBoard.workspace = this, this.vimBoard.hide());
  };
})(Entry.Workspace.prototype);
Entry.Playground = function() {
  this.enableArduino = this.isTextBGMode_ = !1;
  this.viewMode_ = "default";
  var b = this;
  Entry.addEventListener("textEdited", this.injectText);
  Entry.addEventListener("hwChanged", this.updateHW);
  Entry.addEventListener("changeMode", function(a) {
    b.setMode(a);
  });
};
Entry.Playground.prototype.setMode = function(b) {
  this.mainWorkspace.setMode(b);
};
Entry.Playground.prototype.generateView = function(b, a) {
  this.view_ = b;
  this.view_.addClass("entryPlayground");
  if (a && "workspace" != a) {
    "phone" == a && (this.view_.addClass("entryPlaygroundPhone"), d = Entry.createElement("div", "entryCategoryTab"), d.addClass("entryPlaygroundTabPhone"), Entry.view_.insertBefore(d, this.view_), this.generateTabView(d), this.tabView_ = d, d = Entry.createElement("div", "entryCurtain"), d.addClass("entryPlaygroundCurtainPhone"), d.addClass("entryRemove"), d.innerHTML = Lang.Workspace.cannot_edit_click_to_stop, d.bindOnClick(function() {
      Entry.engine.toggleStop();
    }), this.view_.appendChild(d), this.curtainView_ = d, Entry.pictureEditable && (d = Entry.createElement("div", "entryPicture"), d.addClass("entryPlaygroundPicturePhone"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generatePictureView(d), this.pictureView_ = d), d = Entry.createElement("div", "entryText"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generateTextView(d), this.textView_ = d, Entry.soundEditable && (d = Entry.createElement("div", "entrySound"), d.addClass("entryPlaygroundSoundWorkspacePhone"), 
    d.addClass("entryRemove"), this.view_.appendChild(d), this.generateSoundView(d), this.soundView_ = d), d = Entry.createElement("div", "entryDefault"), this.view_.appendChild(d), this.generateDefaultView(d), this.defaultView_ = d, d = Entry.createElement("div", "entryCode"), d.addClass("entryPlaygroundCodePhone"), this.view_.appendChild(d), this.generateCodeView(d), this.codeView_ = this.codeView_ = d, Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    }), Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    }));
  } else {
    this.view_.addClass("entryPlaygroundWorkspace");
    var d = Entry.createElement("div", "entryCategoryTab");
    d.addClass("entryPlaygroundTabWorkspace");
    this.view_.appendChild(d);
    this.generateTabView(d);
    this.tabView_ = d;
    d = Entry.createElement("div", "entryCurtain");
    d.addClass("entryPlaygroundCurtainWorkspace");
    d.addClass("entryRemove");
    var c = Lang.Workspace.cannot_edit_click_to_stop.split(".");
    d.innerHTML = c[0] + ".<br/>" + c[1];
    d.addEventListener("click", function() {
      Entry.engine.toggleStop();
    });
    this.view_.appendChild(d);
    this.curtainView_ = d;
    Entry.pictureEditable && (d = Entry.createElement("div", "entryPicture"), d.addClass("entryPlaygroundPictureWorkspace"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generatePictureView(d), this.pictureView_ = d);
    d = Entry.createElement("div", "entryText");
    d.addClass("entryPlaygroundTextWorkspace");
    d.addClass("entryRemove");
    this.view_.appendChild(d);
    this.generateTextView(d);
    this.textView_ = d;
    Entry.soundEditable && (d = Entry.createElement("div", "entrySound"), d.addClass("entryPlaygroundSoundWorkspace"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generateSoundView(d), this.soundView_ = d);
    d = Entry.createElement("div", "entryDefault");
    d.addClass("entryPlaygroundDefaultWorkspace");
    this.view_.appendChild(d);
    this.generateDefaultView(d);
    this.defaultView_ = d;
    d = Entry.createElement("div", "entryCode");
    d.addClass("entryPlaygroundCodeWorkspace");
    d.addClass("entryRemove");
    this.view_.appendChild(d);
    this.generateCodeView(d);
    this.codeView_ = d;
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundResizeWorkspace", "entryRemove");
    this.resizeHandle_ = c;
    this.view_.appendChild(c);
    this.initializeResizeHandle(c);
    this.codeView_ = d;
    Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    });
    Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    });
  }
};
Entry.Playground.prototype.generateDefaultView = function(b) {
  return b;
};
Entry.Playground.prototype.generateTabView = function(b) {
  var a = this, d = Entry.createElement("ul");
  d.addClass("entryTabListWorkspace");
  this.tabList_ = d;
  b.appendChild(d);
  this.tabViewElements = {};
  b = Entry.createElement("li", "entryCodeTab");
  b.innerHTML = Lang.Workspace.tab_code;
  b.addClass("entryTabListItemWorkspace");
  b.addClass("entryTabSelected");
  d.appendChild(b);
  b.bindOnClick(function(b) {
    a.changeViewMode("code");
    a.blockMenu.reDraw();
  });
  this.tabViewElements.code = b;
  Entry.pictureEditable && (b = Entry.createElement("li", "entryPictureTab"), b.innerHTML = Lang.Workspace.tab_picture, b.addClass("entryTabListItemWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("picture");
  }), this.tabViewElements.picture = b, b = Entry.createElement("li", "entryTextboxTab"), b.innerHTML = Lang.Workspace.tab_text, b.addClass("entryTabListItemWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("text");
  }), this.tabViewElements.text = b, b.addClass("entryRemove"));
  Entry.soundEditable && (b = Entry.createElement("li", "entrySoundTab"), b.innerHTML = Lang.Workspace.tab_sound, b.addClass("entryTabListItemWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("sound");
  }), this.tabViewElements.sound = b);
  Entry.hasVariableManager && (b = Entry.createElement("li", "entryVariableTab"), b.innerHTML = Lang.Workspace.tab_attribute, b.addClass("entryTabListItemWorkspace"), b.addClass("entryVariableTabWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.toggleOnVariableView();
    Entry.playground.changeViewMode("variable");
  }), this.tabViewElements.variable = b);
};
Entry.Playground.prototype.generateCodeView = function(b) {
  var a = this.createVariableView();
  b.appendChild(a);
  this.variableView_ = a;
  b = Entry.Dom(b);
  a = Entry.Dom("div", {parent:b, id:"entryWorkspaceBoard", class:"entryWorkspaceBoard"});
  b = Entry.Dom("div", {parent:b, id:"entryWorkspaceBlockMenu", class:"entryWorkspaceBlockMenu"});
  this.mainWorkspace = new Entry.Workspace({blockMenu:{dom:b, align:"LEFT", categoryData:EntryStatic.getAllBlocks(), scroll:!0}, board:{dom:a}});
  this.blockMenu = this.mainWorkspace.blockMenu;
  this.board = this.mainWorkspace.board;
  this.blockMenu.banClass("checker");
  Entry.hw && this.updateHW();
};
Entry.Playground.prototype.generatePictureView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddPicture");
    a.addClass("entryPlaygroundAddPicture");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    });
    var d = Entry.createElement("div", "entryAddPictureInner");
    d.addClass("entryPlaygroundAddPictureInner");
    d.innerHTML = Lang.Workspace.picture_add;
    a.appendChild(d);
    b.appendChild(a);
    a = Entry.createElement("ul", "entryPictureList");
    a.addClass("entryPlaygroundPictureList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(d, g);
    }, axis:"y"});
    b.appendChild(a);
    this.pictureListView_ = a;
    a = Entry.createElement("div", "entryPainter");
    a.addClass("entryPlaygroundPainter");
    b.appendChild(a);
    this.painter = new Entry.Painter2(a);
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddPicture"), a.addClass("entryPlaygroundAddPicturePhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    }), d = Entry.createElement("div", "entryAddPictureInner"), d.addClass("entryPlaygroundAddPictureInnerPhone"), d.innerHTML = Lang.Workspace.picture_add, a.appendChild(d), b.appendChild(a), a = Entry.createElement("ul", "entryPictureList"), a.addClass("entryPlaygroundPictureListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(d, g);
    }, axis:"y"}), b.appendChild(a), this.pictureListView_ = a);
  }
};
Entry.Playground.prototype.generateTextView = function(b) {
  var a = Entry.createElement("div");
  b.appendChild(a);
  b = Entry.createElement("div");
  b.addClass("textProperties");
  a.appendChild(b);
  var d = Entry.createElement("div");
  d.addClass("entryTextFontSelect");
  b.appendChild(d);
  var c = Entry.createElement("select", "entryPainterAttrFontName");
  c.addClass("entryPlaygroundPainterAttrFontName", "entryTextFontSelecter");
  c.size = "1";
  c.onchange = function(a) {
    Entry.playground.object.entity.setFontType(a.target.value);
  };
  for (var e = 0;e < Entry.fonts.length;e++) {
    var f = Entry.fonts[e], g = Entry.createElement("option");
    g.value = f.family;
    g.innerHTML = f.name;
    c.appendChild(g);
  }
  this.fontName_ = c;
  d.appendChild(c);
  e = Entry.createElement("ul");
  e.addClass("entryPlayground_text_buttons");
  b.appendChild(e);
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignLeft");
  d.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_LEFT);
  });
  e.appendChild(d);
  this.alignLeftBtn = d;
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignCenter");
  d.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_CENTER);
  });
  e.appendChild(d);
  this.alignCenterBtn = d;
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignRight");
  d.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_RIGHT);
  });
  e.appendChild(d);
  this.alignRightBtn = d;
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontBold() ? h.src = Entry.mediaFilePath + "text_button_bold_true.png" : h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  });
  var h = Entry.createElement("img", "entryPlaygroundText_boldImage");
  c.appendChild(h);
  h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getUnderLine() || !1;
    k.src = Entry.mediaFilePath + "text_button_underline_" + a + ".png";
    Entry.playground.object.entity.setUnderLine(a);
  });
  var k = Entry.createElement("img", "entryPlaygroundText_underlineImage");
  c.appendChild(k);
  k.src = Entry.mediaFilePath + "text_button_underline_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontItalic() ? l.src = Entry.mediaFilePath + "text_button_italic_true.png" : l.src = Entry.mediaFilePath + "/text_button_italic_false.png";
  });
  var l = Entry.createElement("img", "entryPlaygroundText_italicImage");
  c.appendChild(l);
  l.src = Entry.mediaFilePath + "text_button_italic_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getStrike() || !1;
    Entry.playground.object.entity.setStrike(a);
    m.src = Entry.mediaFilePath + "text_button_strike_" + a + ".png";
  });
  var m = Entry.createElement("img", "entryPlaygroundText_strikeImage");
  c.appendChild(m);
  m.src = Entry.mediaFilePath + "text_button_strike_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.toggleColourChooser("foreground");
  });
  c = Entry.createElement("img");
  d.appendChild(c);
  c.src = Entry.mediaFilePath + "text_button_color_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  e = Entry.createElement("a");
  d.appendChild(e);
  e.bindOnClick(function() {
    Entry.playground.toggleColourChooser("background");
  });
  d = Entry.createElement("img");
  e.appendChild(d);
  d.src = Entry.mediaFilePath + "text_button_background_false.png";
  e = Entry.createElement("div");
  e.addClass("entryPlayground_fgColorDiv");
  d = Entry.createElement("div");
  d.addClass("entryPlayground_bgColorDiv");
  b.appendChild(e);
  b.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundTextColoursWrapper");
  this.coloursWrapper = c;
  a.appendChild(c);
  b = Entry.getColourCodes();
  for (e = 0;e < b.length;e++) {
    d = Entry.createElement("div"), d.addClass("modal_colour"), d.setAttribute("colour", b[e]), d.style.backgroundColor = b[e], 0 === e && d.addClass("modalColourTrans"), d.bindOnClick(function(a) {
      Entry.playground.setTextColour(a.target.getAttribute("colour"));
    }), c.appendChild(d);
  }
  c.style.display = "none";
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundTextBackgroundsWrapper");
  this.backgroundsWrapper = c;
  a.appendChild(c);
  for (e = 0;e < b.length;e++) {
    d = Entry.createElement("div"), d.addClass("modal_colour"), d.setAttribute("colour", b[e]), d.style.backgroundColor = b[e], 0 === e && d.addClass("modalColourTrans"), d.bindOnClick(function(a) {
      Entry.playground.setBackgroundColour(a.target.getAttribute("colour"));
    }), c.appendChild(d);
  }
  c.style.display = "none";
  b = Entry.createElement("input");
  b.addClass("entryPlayground_textBox");
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditInput = b;
  a.appendChild(b);
  b = Entry.createElement("textarea");
  b.addClass("entryPlayground_textArea");
  b.style.display = "none";
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditArea = b;
  a.appendChild(b);
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundFontSizeWrapper");
  a.appendChild(b);
  this.fontSizeWrapper = b;
  var n = Entry.createElement("div");
  n.addClass("entryPlaygroundFontSizeSlider");
  b.appendChild(n);
  var q = Entry.createElement("div");
  q.addClass("entryPlaygroundFontSizeIndicator");
  n.appendChild(q);
  this.fontSizeIndiciator = q;
  var r = Entry.createElement("div");
  r.addClass("entryPlaygroundFontSizeKnob");
  n.appendChild(r);
  this.fontSizeKnob = r;
  e = Entry.createElement("div");
  e.addClass("entryPlaygroundFontSizeLabel");
  e.innerHTML = "\uae00\uc790 \ud06c\uae30";
  b.appendChild(e);
  var t = !1, u = 0;
  r.onmousedown = function(a) {
    t = !0;
    u = $(n).offset().left;
  };
  r.addEventListener("touchstart", function(a) {
    t = !0;
    u = $(n).offset().left;
  });
  document.addEventListener("mousemove", function(a) {
    t && (a = a.pageX - u, a = Math.max(a, 5), a = Math.min(a, 88), r.style.left = a + "px", a /= .88, q.style.width = a + "%", Entry.playground.object.entity.setFontSize(a));
  });
  document.addEventListener("touchmove", function(a) {
    t && (a = a.touches[0].pageX - u, a = Math.max(a, 5), a = Math.min(a, 88), r.style.left = a + "px", a /= .88, q.style.width = a + "%", Entry.playground.object.entity.setFontSize(a));
  });
  document.addEventListener("mouseup", function(a) {
    t = !1;
  });
  document.addEventListener("touchend", function(a) {
    t = !1;
  });
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakWrapper");
  a.appendChild(b);
  a = Entry.createElement("hr");
  a.addClass("entryPlaygroundLinebreakHorizontal");
  b.appendChild(a);
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakButtons");
  b.appendChild(a);
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!1);
    v.innerHTML = Lang.Menus.linebreak_off_desc_1;
    x.innerHTML = Lang.Menus.linebreak_off_desc_2;
    y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-off-true.png";
  a.appendChild(e);
  this.linebreakOffImage = e;
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!0);
    v.innerHTML = Lang.Menus.linebreak_on_desc_1;
    x.innerHTML = Lang.Menus.linebreak_on_desc_2;
    y.innerHTML = Lang.Menus.linebreak_on_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-on-false.png";
  a.appendChild(e);
  this.linebreakOnImage = e;
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakDescription");
  b.appendChild(a);
  var v = Entry.createElement("p");
  v.innerHTML = Lang.Menus.linebreak_off_desc_1;
  a.appendChild(v);
  b = Entry.createElement("ul");
  a.appendChild(b);
  var x = Entry.createElement("li");
  x.innerHTML = Lang.Menus.linebreak_off_desc_2;
  b.appendChild(x);
  var y = Entry.createElement("li");
  y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  b.appendChild(y);
};
Entry.Playground.prototype.generateSoundView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddSound");
    a.addClass("entryPlaygroundAddSound");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    });
    var d = Entry.createElement("div", "entryAddSoundInner");
    d.addClass("entryPlaygroundAddSoundInner");
    d.innerHTML = Lang.Workspace.sound_add;
    a.appendChild(d);
    b.appendChild(a);
    a = Entry.createElement("ul", "entrySoundList");
    a.addClass("entryPlaygroundSoundList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(d, g);
    }, axis:"y"});
    b.appendChild(a);
    this.soundListView_ = a;
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddSound"), a.addClass("entryPlaygroundAddSoundPhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    }), d = Entry.createElement("div", "entryAddSoundInner"), d.addClass("entryPlaygroundAddSoundInnerPhone"), d.innerHTML = Lang.Workspace.sound_add, a.appendChild(d), b.appendChild(a), a = Entry.createElement("ul", "entrySoundList"), a.addClass("entryPlaygroundSoundListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(d, g);
    }, axis:"y"}), b.appendChild(a), this.soundListView_ = a);
  }
};
Entry.Playground.prototype.injectObject = function(b) {
  if (!b) {
    this.changeViewMode("code"), this.object = null;
  } else {
    if (b !== this.object) {
      this.object && this.object.toggleInformation(!1);
      this.object = b;
      this.setMenu(b.objectType);
      this.injectCode();
      "sprite" == b.objectType && Entry.pictureEditable ? (this.tabViewElements.text && this.tabViewElements.text.addClass("entryRemove"), this.tabViewElements.picture && this.tabViewElements.picture.removeClass("entryRemove")) : "textBox" == b.objectType && (this.tabViewElements.picture && this.tabViewElements.picture.addClass("entryRemove"), this.tabViewElements.text && this.tabViewElements.text.removeClass("entryRemove"));
      var a = this.viewMode_;
      "default" == a ? this.changeViewMode("code") : "picture" != a && "text" != a || "textBox" != b.objectType ? "text" != a && "picture" != a || "sprite" != b.objectType ? "sound" == a && this.changeViewMode("sound") : this.changeViewMode("picture") : this.changeViewMode("text");
      this.reloadPlayground();
    }
  }
};
Entry.Playground.prototype.injectCode = function() {
  var b = this.mainWorkspace;
  b.changeBoardCode(this.object.script);
  b.getBoard().adjustThreadsPosition();
};
Entry.Playground.prototype.injectPicture = function() {
  var b = this.pictureListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.pictures, d = 0, c = a.length;d < c;d++) {
        var e = a[d].view;
        e || console.log(e);
        e.orderHolder.innerHTML = d + 1;
        b.appendChild(e);
      }
      this.selectPicture(this.object.selectedPicture);
    } else {
      Entry.dispatchEvent("pictureClear");
    }
  }
};
Entry.Playground.prototype.addPicture = function(b, a) {
  var d = Entry.cloneSimpleObject(b);
  delete d.id;
  delete d.view;
  b = JSON.parse(JSON.stringify(d));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.pictures);
  this.generatePictureElement(b);
  this.object.addPicture(b);
  this.injectPicture();
  this.selectPicture(b);
};
Entry.Playground.prototype.setPicture = function(b) {
  var a = Entry.container.getPictureElement(b.id, b.objectId), d = $(a);
  if (a) {
    b.view = a;
    a.picture = b;
    a = d.find("#t_" + b.id)[0];
    if (b.fileurl) {
      a.style.backgroundImage = 'url("' + b.fileurl + '")';
    } else {
      var c = b.filename;
      a.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + c.substring(0, 2) + "/" + c.substring(2, 4) + "/thumb/" + c + '.png")';
    }
    d.find("#s_" + b.id)[0].innerHTML = b.dimension.width + " X " + b.dimension.height;
  }
  Entry.container.setPicture(b);
};
Entry.Playground.prototype.downloadPicture = function(b) {
  b = Entry.playground.object.getPicture(b);
  b.fileurl ? window.open(b.fileurl) : window.open("/api/sprite/download/image/" + encodeURIComponent(b.filename) + "/" + encodeURIComponent(b.name) + ".png");
};
Entry.Playground.prototype.clonePicture = function(b) {
  b = Entry.playground.object.getPicture(b);
  this.addPicture(b, !0);
};
Entry.Playground.prototype.selectPicture = function(b) {
  for (var a = this.object.pictures, d = 0, c = a.length;d < c;d++) {
    var e = a[d];
    e.id === b.id ? e.view.addClass("entryPictureSelected") : e.view.removeClass("entryPictureSelected");
  }
  var f;
  b && b.id && (f = Entry.container.selectPicture(b.id, b.objectId));
  this.object.id === f && Entry.dispatchEvent("pictureSelected", b);
};
Entry.Playground.prototype.movePicture = function(b, a) {
  this.object.pictures.splice(a, 0, this.object.pictures.splice(b, 1)[0]);
  this.injectPicture();
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.injectText = function() {
  if (Entry.playground.object) {
    Entry.playground.textEditInput.value = Entry.playground.object.entity.getText();
    Entry.playground.textEditArea.value = Entry.playground.object.entity.getText();
    Entry.playground.fontName_.value = Entry.playground.object.entity.getFontName();
    if (Entry.playground.object.entity.font) {
      var b = -1 < Entry.playground.object.entity.font.indexOf("bold") || !1;
      $("#entryPlaygroundText_boldImage").attr("src", Entry.mediaFilePath + "text_button_bold_" + b + ".png");
      b = -1 < Entry.playground.object.entity.font.indexOf("italic") || !1;
      $("#entryPlaygroundText_italicImage").attr("src", Entry.mediaFilePath + "text_button_italic_" + b + ".png");
    }
    b = Entry.playground.object.entity.getUnderLine() || !1;
    $("#entryPlaygroundText_underlineImage").attr("src", Entry.mediaFilePath + "text_button_underline_" + b + ".png");
    b = Entry.playground.object.entity.getStrike() || !1;
    $("#entryPlaygroundText_strikeImage").attr("src", Entry.mediaFilePath + "text_button_strike_" + b + ".png");
    $(".entryPlayground_fgColorDiv").css("backgroundColor", Entry.playground.object.entity.colour);
    $(".entryPlayground_bgColorDiv").css("backgroundColor", Entry.playground.object.entity.bgColour);
    Entry.playground.toggleLineBreak(Entry.playground.object.entity.getLineBreak());
    Entry.playground.object.entity.getLineBreak() && ($(".entryPlaygroundLinebreakDescription > p").html(Lang.Menus.linebreak_on_desc_1), $(".entryPlaygroundLinebreakDescription > ul > li").eq(0).html(Lang.Menus.linebreak_on_desc_2), $(".entryPlaygroundLinebreakDescription > ul > li").eq(1).html(Lang.Menus.linebreak_on_desc_3));
    Entry.playground.setFontAlign(Entry.playground.object.entity.getTextAlign());
    b = Entry.playground.object.entity.getFontSize();
    Entry.playground.fontSizeIndiciator.style.width = b + "%";
    Entry.playground.fontSizeKnob.style.left = .88 * b + "px";
  }
};
Entry.Playground.prototype.injectSound = function() {
  var b = this.soundListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.sounds, d = 0, c = a.length;d < c;d++) {
        var e = a[d].view;
        e.orderHolder.innerHTML = d + 1;
        b.appendChild(e);
      }
    }
  }
};
Entry.Playground.prototype.moveSound = function(b, a) {
  this.object.sounds.splice(a, 0, this.object.sounds.splice(b, 1)[0]);
  this.updateListViewOrder("sound");
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.addSound = function(b, a) {
  var d = Entry.cloneSimpleObject(b);
  delete d.view;
  delete d.id;
  b = JSON.parse(JSON.stringify(d));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.sounds);
  this.generateSoundElement(b);
  this.object.addSound(b);
  this.injectSound();
};
Entry.Playground.prototype.changeViewMode = function(b) {
  for (var a in this.tabViewElements) {
    this.tabViewElements[a].removeClass("entryTabSelected");
  }
  "default" != b && this.tabViewElements[b].addClass("entryTabSelected");
  if ("variable" != b) {
    var d = this.view_.children;
    for (a = 0;a < d.length;a++) {
      var c = d[a];
      -1 < c.id.toUpperCase().indexOf(b.toUpperCase()) ? c.removeClass("entryRemove") : c.addClass("entryRemove");
    }
    Entry.pictureEditable && ("picture" == b ? (this.painter.show(), this.pictureView_.object && this.pictureView_.object == this.object || (this.pictureView_.object = this.object, this.injectPicture())) : this.painter.hide());
    if ("sound" == b && (!this.soundView_.object || this.soundView_.object != this.object)) {
      this.soundView_.object = this.object, this.injectSound();
    } else {
      if ("text" == b && "textBox" == this.object.objectType || this.textView_.object != this.object) {
        this.textView_.object = this.object, this.injectText();
      }
    }
    "code" == b && this.resizeHandle_ && this.resizeHandle_.removeClass("entryRemove");
    Entry.engine.isState("run") && this.curtainView_.removeClass("entryRemove");
    this.viewMode_ = b;
    this.toggleOffVariableView();
  }
};
Entry.Playground.prototype.createVariableView = function() {
  var b = Entry.createElement("div");
  Entry.type && "workspace" != Entry.type ? "phone" == Entry.type && b.addClass("entryVariablePanelPhone") : b.addClass("entryVariablePanelWorkspace");
  this.variableViewWrapper_ = b;
  Entry.variableContainer.createDom(b);
  return b;
};
Entry.Playground.prototype.toggleOnVariableView = function() {
  Entry.playground.changeViewMode("code");
  this.hideBlockMenu();
  Entry.variableContainer.updateList();
  this.variableView_.removeClass("entryRemove");
  this.resizeHandle_.removeClass("entryRemove");
};
Entry.Playground.prototype.toggleOffVariableView = function() {
  this.showBlockMenu();
  this.variableView_.addClass("entryRemove");
};
Entry.Playground.prototype.editBlock = function() {
  var b = Entry.playground;
  Entry.stateManager && Entry.stateManager.addCommand("edit block", b, b.restoreBlock, b.object, b.object.getScriptText());
};
Entry.Playground.prototype.mouseupBlock = function() {
  if (Entry.reporter) {
    var b = Entry.playground, a = b.object;
    Entry.reporter.report(new Entry.State("edit block mouseup", b, b.restoreBlock, a, a.getScriptText()));
  }
};
Entry.Playground.prototype.restoreBlock = function(b, a) {
  Entry.container.selectObject(b.id);
  Entry.stateManager && Entry.stateManager.addCommand("restore block", this, this.restoreBlock, this.object, this.object.getScriptText());
  Blockly.Xml.textToDom(a);
};
Entry.Playground.prototype.setMenu = function(b) {
  if (this.currentObjectType != b) {
    var a = this.blockMenu;
    a.unbanClass(this.currentObjectType);
    a.banClass(b);
    a.setMenu();
    a.selectMenu(0, !0);
    this.currentObjectType = b;
  }
};
Entry.Playground.prototype.hideTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.hideTab([b[a]]);
  }
};
Entry.Playground.prototype.hideTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("hideTab"), this.tabViewElements[b].removeClass("showTab"));
};
Entry.Playground.prototype.showTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.showTab(b[a]);
  }
};
Entry.Playground.prototype.showTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("showTab"), this.tabViewElements[b].removeClass("hideTab"));
};
Entry.Playground.prototype.initializeResizeHandle = function(b) {
  $(b).bind("mousedown touchstart", function(a) {
    Entry.playground.resizing = !0;
    Entry.documentMousemove && (Entry.playground.resizeEvent = Entry.documentMousemove.attach(this, function(a) {
      Entry.playground.resizing && Entry.resizeElement({menuWidth:a.clientX - Entry.interfaceState.canvasWidth});
    }));
  });
  $(document).bind("mouseup touchend", function(a) {
    if (a = Entry.playground.resizeEvent) {
      Entry.playground.resizing = !1, Entry.documentMousemove.detach(a), delete Entry.playground.resizeEvent;
    }
  });
};
Entry.Playground.prototype.reloadPlayground = function() {
  var b = this.mainWorkspace;
  b && (b.getBlockMenu().reDraw(), this.object && this.object.script.view.reDraw());
};
Entry.Playground.prototype.flushPlayground = function() {
  this.object = null;
  if (Entry.playground && Entry.playground.view_) {
    this.injectPicture();
    this.injectSound();
    var b = Entry.playground.mainWorkspace.getBoard();
    b.clear();
    b.changeCode(null);
  }
};
Entry.Playground.prototype.refreshPlayground = function() {
  Entry.playground && Entry.playground.view_ && ("picture" === this.getViewMode() && this.injectPicture(), "sound" === this.getViewMode() && this.injectSound());
};
Entry.Playground.prototype.updateListViewOrder = function(b) {
  b = "picture" == b ? this.pictureListView_.childNodes : this.soundListView_.childNodes;
  for (var a = 0, d = b.length;a < d;a++) {
    b[a].orderHolder.innerHTML = a + 1;
  }
};
Entry.Playground.prototype.generatePictureElement = function(b) {
  function a() {
    if ("" === this.value.trim()) {
      Entry.deAttachEventListener(this, "blur", a), alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus(), Entry.attachEventListener(this, "blur", a);
    } else {
      for (var b = $(".entryPlaygroundPictureName"), c = 0;c < b.length;c++) {
        if (b.eq(c).val() == f.value && b[c] != this) {
          Entry.deAttachEventListener(this, "blur", a);
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          Entry.attachEventListener(this, "blur", a);
          return;
        }
      }
      b = this.value;
      this.picture.name = b;
      if (c = Entry.playground) {
        if (c.object) {
          var d = c.object.getPicture(this.picture.id);
          d && (d.name = b);
        }
        (d = c.painter) && d.file && (d.file.name = b);
        c.reloadPlayground();
      }
      Entry.dispatchEvent("pictureNameChanged", this.picture);
    }
  }
  var d = Entry.createElement("li", b.id);
  b.view = d;
  d.addClass("entryPlaygroundPictureElement");
  d.picture = b;
  d.bindOnClick(function(a) {
    Entry.playground.selectPicture(this.picture);
  });
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      f.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.clonePicture(b.id);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removePicture(b.id) ? (Entry.removeElement(d), Entry.toast.success(Lang.Workspace.shape_remove_ok, b.name + " " + Lang.Workspace.shape_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.shape_remove_fail, Lang.Workspace.shape_remove_fail_msg);
    }}, {divider:!0}, {text:Lang.Workspace.context_download, callback:function() {
      Entry.playground.downloadPicture(b.id);
    }}], "workspace-contextmenu");
  });
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundPictureOrder");
  d.orderHolder = c;
  d.appendChild(c);
  c = Entry.createElement("div", "t_" + b.id);
  c.addClass("entryPlaygroundPictureThumbnail");
  if (b.fileurl) {
    c.style.backgroundImage = 'url("' + b.fileurl + '")';
  } else {
    var e = b.filename;
    c.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + e.substring(0, 2) + "/" + e.substring(2, 4) + "/thumb/" + e + '.png")';
  }
  d.appendChild(c);
  var f = Entry.createElement("input");
  f.addClass("entryPlaygroundPictureName");
  f.addClass("entryEllipsis");
  f.picture = b;
  f.value = b.name;
  Entry.attachEventListener(f, "blur", a);
  f.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.appendChild(f);
  c = Entry.createElement("div", "s_" + b.id);
  c.addClass("entryPlaygroundPictureSize");
  c.innerHTML = b.dimension.width + " X " + b.dimension.height;
  d.appendChild(c);
};
Entry.Playground.prototype.generateSoundElement = function(b) {
  var a = Entry.createElement("sound", b.id);
  b.view = a;
  a.addClass("entryPlaygroundSoundElement");
  a.sound = b;
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      g.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.addSound(b, !0);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removeSound(b.id) ? (Entry.removeElement(a), Entry.toast.success(Lang.Workspace.sound_remove_ok, b.name + " " + Lang.Workspace.sound_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.sound_remove_fail, "");
      Entry.removeElement(a);
    }}], "workspace-contextmenu");
  });
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundOrder");
  a.orderHolder = d;
  a.appendChild(d);
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundThumbnail");
  c.addClass("entryPlaygroundSoundPlay");
  var e = !1, f;
  c.addEventListener("click", function() {
    e ? (e = !1, c.removeClass("entryPlaygroundSoundStop"), c.addClass("entryPlaygroundSoundPlay"), f.stop()) : (e = !0, c.removeClass("entryPlaygroundSoundPlay"), c.addClass("entryPlaygroundSoundStop"), f = createjs.Sound.play(b.id), f.addEventListener("complete", function(a) {
      c.removeClass("entryPlaygroundSoundStop");
      c.addClass("entryPlaygroundSoundPlay");
      e = !1;
    }), f.addEventListener("loop", function(a) {
    }), f.addEventListener("failed", function(a) {
    }));
  });
  a.appendChild(c);
  var g = Entry.createElement("input");
  g.addClass("entryPlaygroundSoundName");
  g.sound = b;
  g.value = b.name;
  var h = document.getElementsByClassName("entryPlaygroundSoundName");
  g.onblur = function() {
    if ("" === this.value) {
      alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus();
    } else {
      for (var a = 0, b = 0;b < h.length;b++) {
        if (h[b].value == g.value && (a += 1, 1 < a)) {
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          return;
        }
      }
      this.sound.name = this.value;
      Entry.playground.reloadPlayground();
    }
  };
  g.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.appendChild(g);
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundLength");
  d.innerHTML = b.duration + " \ucd08";
  a.appendChild(d);
};
Entry.Playground.prototype.toggleColourChooser = function(b) {
  "foreground" === b ? "none" === this.coloursWrapper.style.display ? (this.coloursWrapper.style.display = "block", this.backgroundsWrapper.style.display = "none") : this.coloursWrapper.style.display = "none" : "background" === b && ("none" === this.backgroundsWrapper.style.display ? (this.backgroundsWrapper.style.display = "block", this.coloursWrapper.style.display = "none") : this.backgroundsWrapper.style.display = "none");
};
Entry.Playground.prototype.setTextColour = function(b) {
  Entry.playground.object.entity.setColour(b);
  Entry.playground.toggleColourChooser("foreground");
  $(".entryPlayground_fgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.setBackgroundColour = function(b) {
  Entry.playground.object.entity.setBGColour(b);
  Entry.playground.toggleColourChooser("background");
  $(".entryPlayground_bgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.isTextBGMode = function() {
  return this.isTextBGMode_;
};
Entry.Playground.prototype.checkVariables = function() {
  Entry.forEBS || (Entry.variableContainer.lists_.length ? this.blockMenu.unbanClass("listNotExist") : this.blockMenu.banClass("listNotExist"), Entry.variableContainer.variables_.length ? this.blockMenu.unbanClass("variableNotExist") : this.blockMenu.banClass("variableNotExist"));
};
Entry.Playground.prototype.getViewMode = function() {
  return this.viewMode_;
};
Entry.Playground.prototype.updateHW = function() {
  var b = Entry.playground.mainWorkspace.blockMenu;
  if (b) {
    var a = Entry.hw;
    a && a.connected ? (b.unbanClass("arduinoConnected", !0), b.banClass("arduinoDisconnected", !0), a.banHW(), a.hwModule && b.unbanClass(a.hwModule.name)) : (b.banClass("arduinoConnected", !0), b.unbanClass("arduinoDisconnected", !0), Entry.hw.banHW());
    b.reDraw();
  }
};
Entry.Playground.prototype.toggleLineBreak = function(b) {
  this.object && "textBox" == this.object.objectType && (b ? (Entry.playground.object.entity.setLineBreak(!0), $(".entryPlayground_textArea").css("display", "block"), $(".entryPlayground_textBox").css("display", "none"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-false.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-true.png", this.fontSizeWrapper.removeClass("entryHide")) : (Entry.playground.object.entity.setLineBreak(!1), $(".entryPlayground_textArea").css("display", 
  "none"), $(".entryPlayground_textBox").css("display", "block"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-true.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-false.png", this.fontSizeWrapper.addClass("entryHide")));
};
Entry.Playground.prototype.setFontAlign = function(b) {
  if ("textBox" == this.object.objectType) {
    this.alignLeftBtn.removeClass("toggle");
    this.alignCenterBtn.removeClass("toggle");
    this.alignRightBtn.removeClass("toggle");
    switch(b) {
      case Entry.TEXT_ALIGN_LEFT:
        this.alignLeftBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_CENTER:
        this.alignCenterBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_RIGHT:
        this.alignRightBtn.addClass("toggle");
    }
    this.object.entity.setTextAlign(b);
  }
};
Entry.Playground.prototype.hideBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().hide();
};
Entry.Playground.prototype.showBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().show();
};
Entry.Xml = {};
Entry.Xml.isTypeOf = function(b, a) {
  return a.getAttribute("type") == b;
};
Entry.Xml.getNextBlock = function(b) {
  b = b.childNodes;
  for (var a = 0;a < b.length;a++) {
    if ("NEXT" == b[a].tagName.toUpperCase()) {
      return b[a].children[0];
    }
  }
  return null;
};
Entry.Xml.getStatementBlock = function(b, a) {
  var d = a.getElementsByTagName("statement");
  if (!d.length) {
    return a;
  }
  for (var c in d) {
    if (d[c].getAttribute("name") == b) {
      return d[c].children[0];
    }
  }
  return null;
};
Entry.Xml.getParentLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && "STATEMENT" == b.tagName.toUpperCase()) {
      return b.parentNode;
    }
    if (b) {
      b = b.parentNode;
    } else {
      return null;
    }
  }
};
Entry.Xml.getParentIterateLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && b.getAttribute("type") && "REPEAT" == b.getAttribute("type").toUpperCase().substr(0, 6)) {
      return b;
    }
    if (!b) {
      return null;
    }
  }
};
Entry.Xml.getParentBlock = function(b) {
  return (b = b.parentNode) ? b.parentNode : null;
};
Entry.Xml.callReturn = function(b) {
  var a = Entry.Xml.getNextBlock(b);
  return a ? a : Entry.Xml.getParentLoop(b);
};
Entry.Xml.isRootBlock = function(b) {
};
Entry.Xml.getValue = function(b, a) {
  var d = a.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if ("VALUE" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == b) {
      return d[c].children[0];
    }
  }
  return null;
};
Entry.Xml.getNumberValue = function(b, a, d) {
  d = d.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].tagName && "VALUE" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == a) {
      return Number(Entry.Xml.operate(b, d[c].children[0]));
    }
  }
  return null;
};
Entry.Xml.getField = function(b, a) {
  var d = a.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].tagName && "FIELD" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == b) {
      return d[c].textContent;
    }
  }
};
Entry.Xml.getNumberField = function(b, a) {
  var d = a.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if ("FIELD" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == b) {
      return Number(d[c].textContent);
    }
  }
};
Entry.Xml.getBooleanValue = function(b, a, d) {
  d = d.getElementsByTagName("value");
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].getAttribute("name") == a) {
      return Entry.Xml.operate(b, d[c].children[0]);
    }
  }
  return null;
};
Entry.Xml.operate = function(b, a) {
  return Entry.block[a.getAttribute("type")](b, a);
};
Entry.Xml.cloneBlock = function(b, a, d) {
  var c = b.cloneNode();
  b.parentNode && "xml" != b.parentNode.tagName && Entry.Xml.cloneBlock(b.parentNode, c, "parent");
  for (var e = 0;e < b.childNodes.length;e++) {
    var f = b.childNodes[e];
    f instanceof Text ? c.textContent = f.textContent : "parent" == d ? c.appendChild(a) : c.appendChild(Entry.Xml.cloneBlock(f, c, "child"));
  }
  return c;
};
Entry.Youtube = function(b) {
  this.generateView(b);
};
p = Entry.Youtube.prototype;
p.init = function(b) {
  this.youtubeHash = b;
  this.generateView();
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryRemove");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "youtubeIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", "https://www.youtube.com/embed/" + b);
  this.movieFrame = a;
  this.movieContainer.appendChild(a);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var b = document.getElementsByClassName("propertyContent")[0], a = document.getElementById("youtubeIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};

