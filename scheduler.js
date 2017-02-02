var Scheduler = (function (element, userConfigs) {
  configs = {
    date: new Date(),
    data: [],
    shortDay: true,
    shortMonth: false,
    mode: 'month'
  };

  days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  shortDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  renderDate = new Date();
  $currentView = $(document.createElement('div'));
  $divToolbar = $(document.createElement('div'));

  init = function () {
    setConfig();
    renderDate = new Date(configs.date.getFullYear(), configs.date.getMonth(), 1);
    renderToolBar();
    $currentView.addClass('sc-view');
    renderBody();
    $element.append($currentView);
    $element.addClass('sc');
  };

  setConfig = function () {
    for (var key in userConfigs) {
      configs[key] = userConfigs[key];
    }
  };

  refreshView = function (data) {
    refreshToolbarTitle();
    clearBody();
    renderBody(data);
  };

  refreshToolbarTitle = function () {
    if (configs.mode == 'month') {
      $divToolbar.find('.sc-center').html('<span>' + getMonthString(renderDate.getMonth()) + ', ' + renderDate.getFullYear() + '</span>');
    }
    else if (configs.mode == 'week') {
      var first = renderDate.getDate() - renderDate.getDay(); // First day is the day of the month - the day of the week
      var last = first + 6; // last day is the first day + 6

      var firstDay = new Date(renderDate);
      firstDay.setDate(first)
      var lastDay = new Date(renderDate);
      lastDay.setDate(last);

      $divToolbar.find('.sc-center').html('<span>' + firstDay.getDate()
        + (firstDay.getMonth() != lastDay.getMonth() ? ' ' + getMonthString(firstDay.getMonth()) : '' )
        + (firstDay.getFullYear() != lastDay.getFullYear() ? ' ' + firstDay.getFullYear() : '')
        + ' - ' + lastDay.getDate() + ' ' + getMonthString(lastDay.getMonth()) + ', ' + lastDay.getFullYear() + '</span>');
    }
    else if (configs.mode == 'day') {
      var first = renderDate.getDate() - renderDate.getDay(); // First day is the day of the month - the day of the week
      var last = first + 6; // last day is the first day + 6

      $divToolbar.find('.sc-center').html('<span>' + getDayString(renderDate.getDay()) + ', '
        + renderDate.getDate() + ' ' + getMonthString(renderDate.getMonth()) + ', ' + renderDate.getFullYear() + '</span>');
    }
  };

  renderBody = function () {
    if (configs.mode == 'month') {
      renderMonth(configs.data);
    }
    else if (configs.mode == 'week') {
      renderWeek(configs.data);
    }
    else if (configs.mode == 'day') {
      renderDay(configs.data);
    }
  };

  renderToolBar = function () {
    $divToolbar.addClass('sc-toolbar');
    var $divLeft = $(document.createElement('div'));
    $divLeft.addClass('sc-left');

    var $divBtnGroup = $(document.createElement('div'));
    var $btn = $(document.createElement('button'));
    $btn.html('<span><</span>');
    $btn.on('click', prevView);
    $divBtnGroup.append($btn);

    $btn = $(document.createElement('button'));
    $btn.html('<span>></span>');
    $btn.on('click', nextView);

    $divBtnGroup.append($btn);
    $divLeft.append($divBtnGroup);

    var $divCenter = $(document.createElement('div'));
    $divCenter.addClass('sc-center');
    $divCenter.html('<span>' + getMonthString(renderDate.getMonth()) + ', ' + renderDate.getFullYear() + '</span>');

    var $divRight = $(document.createElement('div'));
    $divRight.addClass('sc-right');

    $divBtnGroup = $(document.createElement('div'));
    $btn = $(document.createElement('button'));
    $btn.html('<span>month</span>');
    $btn.on('click', setMonthMode);

    $divBtnGroup.append($btn);
    $btn = $(document.createElement('button'));
    $btn.html('<span>week</span>');
    $btn.on('click', setWeekMode);

    $divBtnGroup.append($btn);
    $btn = $(document.createElement('button'));
    $btn.html('<span>day</span>');
    $btn.on('click', setDayMode);

    $divBtnGroup.append($btn);
    $divRight.append($divBtnGroup);

    $divToolbar.append($divLeft);
    $divToolbar.append($divCenter);
    $divToolbar.append($divRight);
    $element.append($divToolbar);
  };

  renderMonth = function (data) {
    var $divWrapper = $(document.createElement('div'));
    $divWrapper.addClass('sc-month-wrapper');
    var $tblCalendar = $(document.createElement('table'));
    var $thdCalendar = $(document.createElement('thead'));
    $thdCalendar.addClass('sc-month-head');
    $thdCalendar.addClass('sc-header');
    var $trCalendar = $(document.createElement('tr'));
    var $tdCalendar = $(document.createElement('td'));

    renderMonthHeader($tdCalendar);

    $trCalendar.append($tdCalendar);
    $thdCalendar.append($trCalendar);
    $tblCalendar.append($thdCalendar);

    var $tbdCalendar = $(document.createElement('tbody'));
    $tbdCalendar.addClass('sc-month-body');
    $trCalendar = $(document.createElement('tr'));
    $tdCalendar = $(document.createElement('td'));

    renderMonthBody($tdCalendar);

    $trCalendar.append($tdCalendar);
    $tbdCalendar.append($trCalendar);
    $tblCalendar.append($tbdCalendar);
    $divWrapper.append($tblCalendar);

    $currentView.append($divWrapper);
    renderMonthEvent($tdCalendar, data);
  };

  renderMonthHeader = function ($parent) {
    var $divHeader = $(document.createElement('div'));
    var $tblHeader = $(document.createElement('div'));
    $tblHeader.addClass('sc-table');
    var $trHeader = $(document.createElement('div'));
    $trHeader.addClass('sc-table-row');

    for (var i = 0; i < 7; i++) {
      var $thHeader = $(document.createElement('div'));
      $thHeader.addClass('sc-table-row-th');
      $thHeader.html('<span>' + getDayString(i) + '</span>');
      $trHeader.append($thHeader);
    }
    $tblHeader.append($trHeader);
    $divHeader.append($tblHeader);
    $parent.append($divHeader);
  };

  renderMonthBody = function ($parent) {
    var firstDateMonth = new Date(renderDate.getFullYear(), renderDate.getMonth(), 1);
    var lastDateMonth = new Date(renderDate.getFullYear(), renderDate.getMonth() + 1, 0);

    var calendarStartDate = new Date(firstDateMonth);
    calendarStartDate.setDate(calendarStartDate.getDate() - (firstDateMonth.getDay() % 7));

    var calendarEndDate = new Date(lastDateMonth);
    calendarEndDate.setDate(calendarEndDate.getDate() + (6 - lastDateMonth.getDay()));

    var currentDate = calendarStartDate;

    while (currentDate <= calendarEndDate) {
      var $divRow = $(document.createElement('div'));
      $divRow.addClass('sc-week-row');
      var $divWrapper = $(document.createElement('div'));
      $divWrapper.addClass('sc-week-row-wrapper');
      var $tblCalendar = $(document.createElement('div'));
      $tblCalendar.addClass('sc-table');
      var $trCalendar = $(document.createElement('div'));
      $trCalendar.addClass('sc-table-row');

      var $divEventWrapper = $(document.createElement('div'));
      $divEventWrapper.addClass('sc-event-row-wrapper');
      var $tblEvent = $(document.createElement('table'));
      var $tbdEvent = $(document.createElement('tbody'));
      var $trEvent = $(document.createElement('tr'));

      for (var i = 0; i < 7; i++) {
        var $thCalendar = $(document.createElement('div'));
        $thCalendar.addClass('sc-table-row-th');
        var $aCalendar = $(document.createElement('a'));
        $thCalendar.addClass('sc-day');
        $thCalendar.addClass('sc-' + shortDays[currentDate.getDay()]);

        if (currentDate.getMonth() != renderDate.getMonth()) {
          $thCalendar.addClass('sc-other-month');
        }

        $aCalendar.html(currentDate.getDate());
        $aCalendar.attr('data-goto', currentDate.toDateString());
        $thCalendar.append($aCalendar);
        $trCalendar.append($thCalendar);

        var $tdEvent = $(document.createElement('td'));
        $tdEvent.attr('data-goto', currentDate.toDateString());
        $trEvent.append($tdEvent);

        currentDate.setDate(currentDate.getDate() + 1);
      }

      $tblCalendar.append($trCalendar);
      $divWrapper.append($tblCalendar);
      $divRow.append($divWrapper);

      $tbdEvent.append($trEvent);
      $tblEvent.append($tbdEvent);
      $divEventWrapper.append($tblEvent);
      $divRow.append($divEventWrapper);

      $parent.append($divRow);
    }
  };

  renderMonthEvent = function ($parent, data) {
    var firstDateMonth = new Date(renderDate.getFullYear(), renderDate.getMonth(), 1);
    var lastDateMonth = new Date(renderDate.getFullYear(), renderDate.getMonth() + 1, 0);

    var calendarStartDate = new Date(firstDateMonth);
    calendarStartDate.setDate(calendarStartDate.getDate() - (firstDateMonth.getDay() % 7));

    var calendarEndDate = new Date(lastDateMonth);
    calendarEndDate.setDate(calendarEndDate.getDate() + (6 - lastDateMonth.getDay()));

    var thisMonthEvents = data.filter(function (el) {
      var start = new Date(el.start);
      var end = new Date(el.end);

	  // Check if start or end day is in between calendar dates, else check if start and end day is overlapping calendar dates
      return (start >= calendarStartDate && start <= calendarEndDate) || (end >= calendarStartDate && end <= calendarEndDate) || (start <= calendarStartDate && end >= calendarEndDate);
    });

    for (var i = 0; i < thisMonthEvents.length; i++) {
      setMonthEvent(thisMonthEvents[i], $parent);
    }
  };

  renderWeek = function (data) {
    var $divWrapper = $(document.createElement('div'));
    $divWrapper.addClass('sc-week-wrapper');

    var $tblCalendar = $(document.createElement('table'));
    var $thdCalendar = $(document.createElement('thead'));
    $thdCalendar.addClass('sc-week-head');
    $thdCalendar.addClass('sc-header');
    var $trCalendar = $(document.createElement('tr'));
    var $tdCalendar = $(document.createElement('td'));

    renderWeekHeader($tdCalendar);

    $trCalendar.append($tdCalendar);
    $thdCalendar.append($trCalendar);
    $tblCalendar.append($thdCalendar);

    var $tbdCalendar = $(document.createElement('tbody'));
    $tbdCalendar.addClass('sc-week-body');
    $trCalendar = $(document.createElement('tr'));
    $tdCalendar = $(document.createElement('td'));

    renderWeekBody($tdCalendar, data);

    $trCalendar.append($tdCalendar);
    $tbdCalendar.append($trCalendar);
    $tblCalendar.append($tbdCalendar);
    $divWrapper.append($tblCalendar);

    $currentView.append($divWrapper);
    renderWeekEvent($tdCalendar, data);
  };

  renderWeekHeader = function ($parent) {
    var $divHeader = $(document.createElement('div'));
    var $tblHeader = $(document.createElement('div'));
    $tblHeader.addClass('sc-table');
    var $trHeader = $(document.createElement('div'));
    $trHeader.addClass('sc-table-row');


    var $thHeader = $(document.createElement('div'));
    $thHeader.addClass('sc-table-row-th');
    $thHeader.addClass('sc-axis');
    $trHeader.append($thHeader);

    var firstDayWeek = new Date(renderDate);
    firstDayWeek.setDate(firstDayWeek.getDate() - renderDate.getDay());

    for (var i = 0; i < 7; i++) {
      $thHeader = $(document.createElement('div'));
      $thHeader.addClass('sc-table-row-th');
	  $thHeader.attr('data-date', firstDayWeek.toDateString());
      $thHeader.html('<span>' + getDayString(i) + ' ' + (firstDayWeek.getMonth() + 1) + '/' + firstDayWeek.getDate() + '</span>');
      $trHeader.append($thHeader);
      firstDayWeek.setDate(firstDayWeek.getDate() + 1);
    }
    $tblHeader.append($trHeader);
    $divHeader.append($tblHeader);
    $parent.append($divHeader);
  };

  renderWeekBody = function ($parent, data) {
    var $divAllDay = $(document.createElement('div'));
    $divAllDay.addClass('sc-all-day-wrapper');
    var $tblAllDay = $(document.createElement('div'));
    $tblAllDay.addClass('sc-table');
    var $trAllDay = $(document.createElement('div'));
    $trAllDay.addClass('sc-table-row');
    $trAllDay.addClass('sc-all-day');

    var $tdAllDay = $(document.createElement('div'));
    $tdAllDay.addClass('sc-table-row-td');
    $tdAllDay.addClass('sc-axis');
    $tdAllDay.html('<span>all day</span>');
    $trAllDay.append($tdAllDay);
	
    var $tblAllDayEvent = $(document.createElement('div'));
	$tblAllDayEvent.addClass('sc-table');
	$tblAllDayEvent.addClass('sc-all-day-event');
	var $trAllDayEvent = $(document.createElement('div'));
    $trAllDayEvent.addClass('sc-table-row');
	var $tdAllDayEvent = $(document.createElement('div'));
    $tdAllDayEvent.addClass('sc-table-row-td');
    $tdAllDayEvent.addClass('sc-axis');
	$trAllDayEvent.append($tdAllDayEvent);
	
	var $tblTimeEvent = $(document.createElement('div'));
	$tblTimeEvent.addClass('sc-table');
	$tblTimeEvent.addClass('sc-time-event');
    var $trTimeEvent = $(document.createElement('div'));
    $trTimeEvent.addClass('sc-table-row');
    var $tdTimeEvent = $(document.createElement('div'));
    $tdTimeEvent.addClass('sc-table-row-td');
    $tdTimeEvent.addClass('sc-axis');
	$trTimeEvent.append($tdTimeEvent);

    for (var i = 0; i < 7; i++) {
      $tdAllDay = $(document.createElement('div'));
      $tdAllDay.addClass('sc-table-row-td');
      $trAllDay.append($tdAllDay);
	  
      $tdAllDayEvent = $(document.createElement('div'));
      $tdAllDayEvent.addClass('sc-table-row-td');
      $trAllDayEvent.append($tdAllDayEvent);
	  
      $tdTimeEvent = $(document.createElement('div'));
      $tdTimeEvent.addClass('sc-table-row-td');
      $tdTimeEvent.addClass('sc-time-event-col');
      $trTimeEvent.append($tdTimeEvent);
    }

    $tblAllDay.append($trAllDay);
    $divAllDay.append($tblAllDay);
	
	$tblAllDayEvent.append($trAllDayEvent);
    $divAllDay.append($tblAllDayEvent);
	
    $parent.append($divAllDay);

    var $divTimeBody = $(document.createElement('div'));
    $divTimeBody.addClass('sc-time-row-wrapper');
    var $tblTimeBody = $(document.createElement('div'));
    $tblTimeBody.addClass('sc-table');

    for (var i = 0; i < 48; i++) {
	  var rowTime = (i < 20) ? ('0' + Math.floor(i / 2)) + ':' : Math.floor(i / 2) + ':';
	  
      var $trTimeBody = $(document.createElement('div'));
      $trTimeBody.addClass('sc-table-row');
      $trTimeBody.addClass('sc-time-row');
      var $tdTimeBody = $(document.createElement('div'));
      $tdTimeBody.addClass('sc-table-row-td');
      $tdTimeBody.addClass('sc-axis');
	  
      if (i % 2 == 0) {
        var time = ((i % 24) / 2);
        time = ((time == 0) ? 12 : time);
        $tdTimeBody.html('<span>' + time + (i < 24 ? 'am' : 'pm') + '</span>');
		
		rowTime += '00';
      }
      else {
        $tdTimeBody.addClass('sc-time-second');
		
		rowTime += '30';
      }
      $trTimeBody.append($tdTimeBody);
	  $trTimeBody.attr('data-time', rowTime);

      for (var j = 0; j < 7; j++) {
        $tdTimeBody = $(document.createElement('div'));
        $tdTimeBody.addClass('sc-table-row-td');
        $trTimeBody.append($tdTimeBody);

        if (i % 2 != 0) {
          $tdTimeBody.addClass('sc-time-second');
        }
      }
      $tblTimeBody.append($trTimeBody);
    }
    $divTimeBody.append($tblTimeBody);

	$tblTimeEvent.append($trTimeEvent);
    $divTimeBody.append($tblTimeEvent);

    $parent.append($divTimeBody);
  };

  renderWeekEvent = function ($parent, data) {
    var firstDayWeek = new Date(renderDate);
    firstDayWeek.setDate(firstDayWeek.getDate() - renderDate.getDay());
	
	var lastDayWeek = new Date(firstDayWeek);
	lastDayWeek.setDate(lastDayWeek.getDate() + 7);

    var thisWeekEvents = data.filter(function (el) {
      var start = new Date(el.start);
      var end = new Date(el.end);

	  // Check if start or end day is in between week, else check if start and end day is overlapping week
      return (start >= firstDayWeek && start <= lastDayWeek) || (end >= firstDayWeek && end <= lastDayWeek) || (start <= firstDayWeek && end >= lastDayWeek);
    });
	
	/* var curDay = new Date(firstDayWeek);
	while (curDay < lastDayWeek) {
	  var curDayEvents = data.filter(function (el) {
		var start = new Date(el.start);
        var end = new Date(el.end);
		
		return (start >= curDay && end <= curDay) || curDay.toDateString() == start.toDateString() || curDay.toDateString() == end.toDateString();
	  });

      for (var i = 0; i < curDayEvents.length; i++) {
        setWeekEvent(curDayEvents[i], $parent);
      }
	  
	  curDay.setDate(curDay.getDate() + 1);
	} */
	
	thisWeekEvents.sort(function(a, b) {
	  var aHours = hoursBetween(new Date(a.start), new Date(a.end));
	  var bHours = hoursBetween(new Date(b.start), new Date(b.end));
	  
	  return bHours - aHours;
	});
	
	// Calculating overlapping time
	for (var i = 0; i < thisWeekEvents.length; i++) {
	  //var overlapCount = 1;
	  var overlapStart = [];
	  var overlapMid = [];
	  var overlapEnd = [];
	  for (var j = 0; j < thisWeekEvents.length; j++) {
		if (i == j) {
		  overlapStart.push(i);
		  continue;
		}
		else if ((thisWeekEvents[i].start >= thisWeekEvents[j].start && thisWeekEvents[i].start < thisWeekEvents[j].end)) {
		  overlapStart.push(j);
	      //overlapCount++;
		}
	  }
	  
	  for (var j = 0; j < thisWeekEvents.length; j++) {
		if (i == j) {
		  overlapEnd.push(i);
		  continue;
		}
		else if ((thisWeekEvents[i].end > thisWeekEvents[j].start && thisWeekEvents[i].end <= thisWeekEvents[j].end)) {
		  overlapEnd.push(j);
	      //overlapCount++;
		}
	  }
	  
	  for (var j = 0; j < thisWeekEvents.length; j++) {
		if (i == j) {
		  overlapMid.push(i);
		  continue;
		}
		else if ((thisWeekEvents[i].start <= thisWeekEvents[j].start && thisWeekEvents[i].end >= thisWeekEvents[j].end)) {
		  overlapMid.push(j);
	      //overlapCount++;
		}
	  }
	  //thisWeekEvents[i].overlapCount = overlapCount;
	  thisWeekEvents[i].width = 90 / Math.max(overlapStart.length, overlapMid.length, overlapEnd.length);
	  var bigOverlap = ((overlapStart.length > overlapMid.length) ? 
	    ((overlapStart.length > overlapEnd.length) ? overlapStart : overlapEnd) : 
		((overlapMid.length > overlapEnd.length) ? overlapMid : overlapEnd));
	  var index = bigOverlap.indexOf(i);
	  thisWeekEvents[i].left = (index > 0) ? thisWeekEvents[bigOverlap[index - 1]].left + thisWeekEvents[bigOverlap[index - 1]].width : 0;
	}
	
    for (var i = 0; i < thisWeekEvents.length; i++) {
      setWeekEvent(thisWeekEvents[i], $parent);
    }
  };

  renderDay = function (data) {
    var $divWrapper = $(document.createElement('div'));
    $divWrapper.addClass('sc-day-wrapper');

    var $tblCalendar = $(document.createElement('table'));
    var $thdCalendar = $(document.createElement('thead'));
    $thdCalendar.addClass('sc-day-head');
    $thdCalendar.addClass('sc-header');
    var $trCalendar = $(document.createElement('tr'));
    var $tdCalendar = $(document.createElement('td'));

    renderDayHeader($tdCalendar);

    $trCalendar.append($tdCalendar);
    $thdCalendar.append($trCalendar);
    $tblCalendar.append($thdCalendar);

    var $tbdCalendar = $(document.createElement('tbody'));
    $tbdCalendar.addClass('sc-day-body');
    $trCalendar = $(document.createElement('tr'));
    $tdCalendar = $(document.createElement('td'));

    renderDayBody($tdCalendar, data);

    $trCalendar.append($tdCalendar);
    $tbdCalendar.append($trCalendar);
    $tblCalendar.append($tbdCalendar);
    $divWrapper.append($tblCalendar);

    $currentView.append($divWrapper);
  };

  renderDayHeader = function ($parent) {
    var $divHeader = $(document.createElement('div'));
    var $tblHeader = $(document.createElement('div'));
    $tblHeader.addClass('sc-table');
    var $trHeader = $(document.createElement('div'));
    $trHeader.addClass('sc-table-row');

    var $thHeader = $(document.createElement('div'));
    $thHeader.addClass('sc-axis');
    $thHeader.addClass('sc-table-row-th');
    $trHeader.append($thHeader);

    $thHeader = $(document.createElement('div'));
    $thHeader.addClass('sc-table-row-th');
    $thHeader.html('<span>' + getDayString(renderDate.getDay()) + ' '
      + (renderDate.getMonth() + 1) + '/' + renderDate.getDate() + '</span>');
    $trHeader.append($thHeader);

    $tblHeader.append($trHeader);
    $divHeader.append($tblHeader);

    $parent.append($divHeader);
  };

  renderDayBody = function ($parent, data) {
    var $divAllDay = $(document.createElement('div'));
    var $tblAllDay = $(document.createElement('div'));
    $tblAllDay.addClass('sc-table');
    var $trAllDay = $(document.createElement('div'));
    $trAllDay.addClass('sc-table-row');
    $trAllDay.addClass('sc-all-day');

    var $tdAllDay = $(document.createElement('div'));
    $tdAllDay.addClass('sc-table-row-td');
    $tdAllDay.addClass('sc-axis');
    $tdAllDay.html('<span>all day</span>');
    $trAllDay.append($tdAllDay);

    $tdAllDay = $(document.createElement('div'));
    $tdAllDay.addClass('sc-table-row-td');
    $trAllDay.append($tdAllDay);

    $tblAllDay.append($trAllDay);
    $divAllDay.append($tblAllDay);
    $parent.append($divAllDay);

    var $divTimeBody = $(document.createElement('div'));
    var $tblTimeBody = $(document.createElement('div'));
    $tblTimeBody.addClass('sc-table');

    for (var i = 0; i < 48; i++) {
      var $trTimeBody = $(document.createElement('div'));
      $trTimeBody.addClass('sc-table-row');
      $trTimeBody.addClass('sc-time-row');
      var $tdTimeBody = $(document.createElement('div'));
      $tdTimeBody.addClass('sc-table-row-td');
      $tdTimeBody.addClass('sc-axis');
      if (i % 2 == 0) {
        var time = ((i % 24) / 2);
        time = ((time == 0) ? 12 : time);
        $tdTimeBody.html('<span>' + time + (i < 24 ? 'am' : 'pm') + '</span>');
      }
      else {
        $tdTimeBody.addClass('sc-time-second');
      }
      $trTimeBody.append($tdTimeBody);

      $tdTimeBody = $(document.createElement('div'));
      $tdTimeBody.addClass('sc-table-row-td');
      if (i % 2 != 0) {
        $tdTimeBody.addClass('sc-time-second');
      }
      $trTimeBody.append($tdTimeBody);

      $tblTimeBody.append($trTimeBody);
    }
    $divTimeBody.append($tblTimeBody);
    $parent.append($divTimeBody);
  };

  renderFooter = function () {
  };

  clearBody = function () {
    $currentView.empty();
  };

  prevView = function () {
    if (configs.mode == 'month') {
      renderDate.setMonth(renderDate.getMonth() - 1);
    }
    else if (configs.mode == 'week') {
      renderDate.setDate(renderDate.getDate() - 7);
    }
    else if (configs.mode == 'day') {
      renderDate.setDate(renderDate.getDate() - 1);
    }
    refreshView();
  };

  nextView = function () {
    if (configs.mode == 'month') {
      renderDate.setMonth(renderDate.getMonth() + 1);
    }
    else if (configs.mode == 'week') {
      renderDate.setDate(renderDate.getDate() + 7);
    }
    else if (configs.mode == 'day') {
      renderDate.setDate(renderDate.getDate() + 1);
    }
    refreshView();
  };

  setMonthMode = function () {
    if (configs.mode != 'month') {
      configs.mode = 'month';
      refreshView();
    }
  };

  setWeekMode = function () {
    if (configs.mode != 'week') {
      configs.mode = 'week';
      refreshView();
    }
  };

  setDayMode = function () {
    if (configs.mode != 'day') {
      configs.mode = 'day';
      refreshView();
    }
  };

  setMonthEvent = function (event, $parent = $('.sc .sc-month-body')) {
    var start = new Date(event.start),
      end = new Date(event.end),
      title = event.title,
      $divEvent = $(document.createElement('div'));
      $divEvent.addClass('sc-event-item');
      $divEvent.html('<span>' + start.toLocaleTimeString() + '</span><span>' + title + '</span>');

    if (start.toDateString() == end.toDateString()) {
      var $startTd = $parent.find('td[data-goto="' + start.toDateString() + '"]');
      if($startTd.html() == '') {
        $divEvent.addClass('sc-event-first-item');
        $startTd.append($divEvent);
      }
      else {
        var colIndex = $startTd[0].cellIndex;
        var $parentTable = $startTd.closest('table');
        var foundEmpty = false;

        $parentTable.find('td:nth-child(' + (colIndex + 1) + ')').each(function() {
          if ($(this).html() == '') {
            $(this).append($divEvent);
            foundEmpty = true;
            return false;
          }
        });

        if (!foundEmpty) {
          var newRow = $parentTable[0].insertRow($parentTable[0].rows.length);
          // insert table cells to the new row
          for (i = 0; i < 7; i++) {
            var cell = newRow.insertCell(i);
            if ((colIndex) == i) {
              $(cell).append($divEvent);
            }
          }
        }
      }
    }
    else {
      var days = daysBetween(start.toDateString(), end.toDateString()) + 1; // Plus 1 for counting days
      var trueStart = new Date(start);
      var $startTd = $parent.find('td[data-goto="' + start.toDateString() + '"]');
      var isLastMonth = false;

      if ($startTd.length == 0) {
        isLastMonth = true;
        var firstDateMonth = new Date(renderDate.getFullYear(), renderDate.getMonth(), 1);
        var calendarStartDate = new Date(firstDateMonth);
        calendarStartDate.setDate(calendarStartDate.getDate() - (firstDateMonth.getDay() % 7));

        trueStart = calendarStartDate;
      }

      while (days > 0) {
        var createNewRow = false;
        $startTd = $parent.find('td[data-goto="' + trueStart.toDateString() + '"]');
        var $parentTable = $startTd.closest('table');
        var colIndex = $startTd[0].cellIndex;

        var row = $parentTable[0].rows[$startTd[0].closest('tr').rowIndex];

        for (var i = colIndex, col; col = row.cells[i]; i++) {
          if ($(col).html() != '') {
            createNewRow = true;
            break;
          }
          else if (colIndex > days) {
            break;
          }
        }

        var colspan = 0;

        if (createNewRow) {
          var newRow = $parentTable[0].insertRow($parentTable[0].rows.length);


          for (i = 0; i < 7; i++) {
            var cell = newRow.insertCell(i);
            if ((colIndex) == i && days > 0) {
              colIndex++;
              colspan++;
              days--;
              trueStart.setDate(trueStart.getDate() + 1);

              if (days == 0 || colIndex == 7) {
                var $divEvents = $(document.createElement('div'));
                $divEvents.addClass('sc-event-items');
                $divEvents.html('<span>' + title + '</span>');
                $(cell).attr('colspan', colspan);
                $(cell).append($divEvents);
              }
              else {
                $(cell).hide();
              }
            }
          }
        }
        else {
          for (i = colIndex, cell; cell = $parentTable[0].rows[0].cells[i]; i++) {
            if ((colIndex) == i && days > 0) {
              colIndex++;
              colspan++;
              days--;
              trueStart.setDate(trueStart.getDate() + 1);

              if (days == 0 || colIndex == 7) {
                var $divEvents = $(document.createElement('div'));
                $divEvents.addClass('sc-event-items');
                $divEvents.html('<span>' + title + '</span>');
                $(cell).attr('colspan', colspan);
                $(cell).append($divEvents);
                break;
              }
              else {
                $(cell).hide();
              }
            }
          }
        }
      }
    }
  };
  
  setWeekEvent = function (event, $parent = $('.sc .sc-week-body')) {
	var start = new Date(event.start),
      end = new Date(event.end),
      title = event.title,
      $divEvent = $(document.createElement('div'));
      $divEvent.addClass('sc-time-event-item');
      $divEvent.html('<span>' + start.getHours() + ' - ' + end.getHours() + '</span><span>' + title + '</span>');
	
	if (start.toDateString() == end.toDateString()) {
	  var startPosition = start.getHours() * 40;
	  startPosition += Math.round((start.getMinutes() / 60) * 40);
	  var eventHeight = Math.round(hoursBetween(start, end) * 40);
	  
	  $divEvent.css({ top: startPosition + 'px', height: eventHeight + 'px', width: event.width + '%', left: event.left + '%' });
	  
	  var colIndex = $('.sc .sc-week-head').find('div[data-date="' + start.toDateString() + '"]').index();
	  
	  var $column = $parent.find('.sc-time-event > .sc-table-row').children().eq(colIndex);
	  
	  $column.append($divEvent);
	}
	
	
  }
  
  addEvents = function (events) {
    if (configs.mode == 'month') {
	  for (var i = 0, event; event = events; i++) {
        setMonthEvent(event);
	  }
    }
    else if (configs.mode == 'week') {
	  for (var i = 0, event; event = events; i++) {
        setWeekEvent(event);
	  }
    }
    else if (configs.mode == 'day') {
	  for (var i = 0, event; event = events; i++) {
        setWeekEvent(event);
	  }
    }
  }

  getDayString = function (day) {
    return (configs.shortDay ? shortDays[day] : days[day]);
  };

  getMonthString = function (month) {
    return (configs.shortMonth ? months[month] : months[month]);
  };

  treatAsUTC = function (date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  };

  daysBetween = function (startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
  };
  
  hoursBetween = function (startDate, endDate) {
	return (Math.abs(treatAsUTC(startDate) - treatAsUTC(endDate)) / 36e5)
  }

  init();

  return {
    element: element,
    refreshView: refreshView,
    prevView: prevView,
    nextView: nextView,
    addEvents: addEvents
  };
});

$.fn.scheduler = function (configs) {
  $element = $(this);
  var scheduler = $element.data('scheduler');

  if (scheduler) {

  }
  else if (!scheduler) {
    scheduler = new Scheduler(this, configs);
    $element.data('scheduler', scheduler);
  }


  return scheduler;
};
