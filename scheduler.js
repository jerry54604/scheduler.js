var Scheduler = (function (element, userConfigs) {
  configs = {
    date: new Date(),
    data: [],
    mode: 'month',
    onInit: function (e) { },
    onRendered: function (e) { },
    onRefreshed: function (e) { },
    onNextView: function (e) { },
    onPreviousView: function (e) { },
    onDataBinding: function (e) { },
    onDataBound: function (e) { },
    onDataAdd: function (e) { },
    onDataEdit: function (e) { },
    onDataDelete: function (e) { }
  };

  days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  shortDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  renderDate = new Date();
  shortDisplay: false;
  $currentView = $(document.createElement('div'));
  $divToolbar = $(document.createElement('div'));
  mediaQuery = window.matchMedia('(max-width: 699px)');
  eventCount = 0;
  eventDragging = null;

  init = function () {
    setConfig();
    dispatchEvent(configs.onInit);
    processData();
    shortDisplay = window.matchMedia('(max-width: 699px)').matches;
    renderDate = new Date(configs.date.getFullYear(), configs.date.getMonth(), 1);
    renderToolBar();
    $currentView.addClass('sc-view');
    renderBody();
    $element.append($currentView);
    $element.addClass('sc');
    dispatchEvent(configs.onRendered);
  };

  setConfig = function () {
    for (var key in userConfigs) {
      if (key == 'source') {
        
      }
      else {
        configs[key] = userConfigs[key];
      }
    }
  };

  refreshView = function (data) {
    $currentView.fadeOut(200, function () {
      refreshToolbarTitle();
      clearBody();
      renderBody(data);
      $currentView.show();
      dispatchEvent(configs.onRefreshed);
    });
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
      $thHeader.html('<span class="sc-header-day-text">' + getDayString(i) + '</span>');
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
      $trCalendar.on('click', 'a', function () { gotoDay($(this).attr('data-goto')); });
      $divRow.on('dragenter', '.sc-day', eventDragEnter);
      $divRow.on('dragover', '.sc-day', eventDragOver);
      $divRow.on('drop', '.sc-day', eventDrop);

      var $divEventWrapper = $(document.createElement('div'));
      $divEventWrapper.addClass('sc-event-row-wrapper');
      $divEventWrapper.on('dragstart', '.sc-event-items, .sc-event-item', eventDragStart);
      $divEventWrapper.on('dragend', '.sc-event-items, .sc-event-item', eventDragEnd);
      var $tblEvent = $(document.createElement('table'));
      var $tbdEvent = $(document.createElement('tbody'));
      var $trEvent = $(document.createElement('tr'));

      for (var i = 0; i < 7; i++) {
        var $thCalendar = $(document.createElement('div'));
        $thCalendar.addClass('sc-table-row-th');
        var $aCalendar = $(document.createElement('a'));
        $thCalendar.addClass('sc-day');
        $thCalendar.addClass('sc-' + shortDays[currentDate.getDay()]);
        $thCalendar.attr('data-date', currentDate.toDateString());

        if (currentDate.getMonth() != renderDate.getMonth()) {
          $thCalendar.addClass('sc-other-month');
        }

        $aCalendar.html(currentDate.getDate());
        $aCalendar.attr('data-goto', currentDate.toDateString());
        $thCalendar.append($aCalendar);
        $trCalendar.append($thCalendar);

        var $tdEvent = $(document.createElement('td'));
        $tdEvent.attr('data-date', currentDate.toDateString());
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
    dispatchEvent(configs.onDataBinding);
    var firstDateMonth = new Date(renderDate.getFullYear(), renderDate.getMonth(), 1);
    var lastDateMonth = new Date(renderDate.getFullYear(), renderDate.getMonth() + 1, 0);

    var calendarStartDate = new Date(firstDateMonth);
    calendarStartDate.setDate(calendarStartDate.getDate() - (firstDateMonth.getDay() % 7));

    var calendarEndDate = new Date(lastDateMonth);
    calendarEndDate.setDate(calendarEndDate.getDate() + (6 - lastDateMonth.getDay()));

    var thisMonthEvents = data.filter(function (el) {
      var start = new Date(el.start);
      var end = new Date(el.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // Check if start or end day is in between calendar dates, else check if start and end day is overlapping calendar dates
      return (start >= calendarStartDate && start <= calendarEndDate) || (end >= calendarStartDate && end <= calendarEndDate) || (start <= calendarStartDate && end >= calendarEndDate);
    });

    for (var i = 0; i < thisMonthEvents.length; i++) {
      setMonthEvent(thisMonthEvents[i], $parent);
    }
    dispatchEvent(configs.onDataBound);
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
      $thHeader.html('<span class="sc-header-day-text">' + getDayString(i) + '</span><span> ' + (firstDayWeek.getMonth() + 1) + '/' + firstDayWeek.getDate() + '</span>');
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
    
    var $tblAllDayEvent = $(document.createElement('table'));
    $tblAllDayEvent.addClass('sc-all-day-event');
    var $trAllDayEvent = $(document.createElement('tr'));
    var $tdAllDayEvent = $(document.createElement('td'));
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
      
      $tdAllDayEvent = $(document.createElement('td'));
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
      var rowTime = formatNumber(Math.floor(i / 2)) + ':';
      
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
    dispatchEvent(configs.onDataBinding);
    var firstDayWeek = new Date(renderDate);
    firstDayWeek.setDate(firstDayWeek.getDate() - renderDate.getDay());
    
    var lastDayWeek = new Date(firstDayWeek);
    lastDayWeek.setDate(lastDayWeek.getDate() + 7);

    var thisWeekEvents = data.filter(function (el) {
      var start = new Date(el.start);
      var end = new Date(el.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // Check if start or end day is in between week, else check if start and end day is overlapping week
      return (start >= firstDayWeek && start <= lastDayWeek) || (end >= firstDayWeek && end <= lastDayWeek) || (start <= firstDayWeek && end >= lastDayWeek);
    });
    
    // Calculating overlapping time
    for (var i = 0; i < thisWeekEvents.length; i++) {
      var overlapStart = [];
      var overlapMid = [];
      var overlapEnd = [];
      for (var j = 0; j < thisWeekEvents.length; j++) {
        if (i == j) {
          overlapStart.push(i);
          continue;
        }
        else if ((thisWeekEvents[i].start >= thisWeekEvents[j].start && thisWeekEvents[i].start < thisWeekEvents[j].end) 
            && (thisWeekEvents[i].start.toDateString() == thisWeekEvents[j].start.toDateString() && thisWeekEvents[i].end.toDateString() == thisWeekEvents[j].end.toDateString())) {
          overlapStart.push(j);
        }
      }
      
      for (var j = 0; j < thisWeekEvents.length; j++) {
        if (i == j) {
          overlapEnd.push(i);
          continue;
        }
        else if ((thisWeekEvents[i].end > thisWeekEvents[j].start && thisWeekEvents[i].end <= thisWeekEvents[j].end)
            && (thisWeekEvents[i].start.toDateString() == thisWeekEvents[j].start.toDateString() && thisWeekEvents[i].end.toDateString() == thisWeekEvents[j].end.toDateString())) {
          overlapEnd.push(j);
        }
      }
      
      for (var j = 0; j < thisWeekEvents.length; j++) {
        if (i == j) {
          overlapMid.push(i);
          continue;
        }
        else if ((thisWeekEvents[i].start <= thisWeekEvents[j].start && thisWeekEvents[i].end >= thisWeekEvents[j].end)
            && (thisWeekEvents[i].start.toDateString() == thisWeekEvents[j].start.toDateString() && thisWeekEvents[i].end.toDateString() == thisWeekEvents[j].end.toDateString())) {
          overlapMid.push(j);
        }
      }
      
      var width = 90 / Math.max(overlapStart.length, overlapEnd.length);
      
      if (thisWeekEvents[i].width == null)
        thisWeekEvents[i].width = width;
      else if (thisWeekEvents[i].width > width)
        thisWeekEvents[i].width = width;
      
      var bigOverlap = ((overlapStart.length > overlapEnd.length) ? overlapStart : overlapEnd);
        
      var index = bigOverlap.indexOf(i);
      
      for (var j = 0; j < bigOverlap.length; j++) {
        if (thisWeekEvents[bigOverlap[j]].width > width)
          thisWeekEvents[bigOverlap[j]].width = width;
      }
      
      thisWeekEvents[i].left = (index > 0) ? thisWeekEvents[bigOverlap[index - 1]].left + thisWeekEvents[bigOverlap[index - 1]].width : 0;
    }
    
    for (var i = 0; i < thisWeekEvents.length; i++) {
      setWeekEvent(thisWeekEvents[i], $parent);
    }
    dispatchEvent(configs.onDataBound);
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
    renderDayEvent($tdCalendar, data);
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
    $thHeader.attr('data-date', renderDate.toDateString());
    $thHeader.html('<span class="sc-header-day-text">' + getDayString(renderDate.getDay()) + '</span><span> '
      + (renderDate.getMonth() + 1) + '/' + renderDate.getDate() + '</span>');
    $trHeader.append($thHeader);

    $tblHeader.append($trHeader);
    $divHeader.append($tblHeader);

    $parent.append($divHeader);
  };

  renderDayBody = function ($parent, data) {
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

    $tdAllDay = $(document.createElement('div'));
    $tdAllDay.addClass('sc-table-row-td');
    $trAllDay.append($tdAllDay);

    $tblAllDay.append($trAllDay);
    $divAllDay.append($tblAllDay);
    
    var $tblAllDayEvent = $(document.createElement('table'));
    $tblAllDayEvent.addClass('sc-all-day-event');
    var $trAllDayEvent = $(document.createElement('tr'));
    var $tdAllDayEvent = $(document.createElement('td'));
    $tdAllDayEvent.addClass('sc-axis');
    $trAllDayEvent.append($tdAllDayEvent);
    
    $tdAllDayEvent = $(document.createElement('td'));
    $trAllDayEvent.append($tdAllDayEvent);
    
    $tblAllDayEvent.append($trAllDayEvent);
    $divAllDay.append($tblAllDayEvent);
    
    $parent.append($divAllDay);
    
    var $tblTimeEvent = $(document.createElement('div'));
    $tblTimeEvent.addClass('sc-table');
    $tblTimeEvent.addClass('sc-time-event');
    var $trTimeEvent = $(document.createElement('div'));
    $trTimeEvent.addClass('sc-table-row');
    var $tdTimeEvent = $(document.createElement('div'));
    $tdTimeEvent.addClass('sc-table-row-td');
    $tdTimeEvent.addClass('sc-axis');
    $trTimeEvent.append($tdTimeEvent);
    
    $tdTimeEvent = $(document.createElement('div'));
    $tdTimeEvent.addClass('sc-table-row-td');
    $tdTimeEvent.addClass('sc-time-event-col');
    $trTimeEvent.append($tdTimeEvent);

    var $divTimeBody = $(document.createElement('div'));
    $divTimeBody.addClass('sc-time-row-wrapper');
    var $tblTimeBody = $(document.createElement('div'));
    $tblTimeBody.addClass('sc-table');

    for (var i = 0; i < 48; i++) {
      var rowTime = formatNumber(Math.floor(i / 2)) + ':';
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

      $tdTimeBody = $(document.createElement('div'));
      $tdTimeBody.addClass('sc-table-row-td');
      if (i % 2 != 0) {
        $tdTimeBody.addClass('sc-time-second');
      }
      $trTimeBody.append($tdTimeBody);

      $tblTimeBody.append($trTimeBody);
    }
    $divTimeBody.append($tblTimeBody);
    
    $tblTimeEvent.append($trTimeEvent);
    $divTimeBody.append($tblTimeEvent);
    
    $parent.append($divTimeBody);
  };

  renderDayEvent = function ($parent, data) {
    dispatchEvent(configs.onDataBinding);
    var thisDayEvents = data.filter(function (el) {
      var start = new Date(el.start);
      var end = new Date(el.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // Check if start or end day is in between week, else check if start and end day is overlapping week
      return (start.toDateString() == renderDate.toDateString() || end.toDateString() == renderDate.toDateString()) || (start <= renderDate && end >= renderDate);
    });
    
    // Calculating overlapping time
    for (var i = 0; i < thisDayEvents.length; i++) {
      var overlapStart = [];
      var overlapMid = [];
      var overlapEnd = [];
      for (var j = 0; j < thisDayEvents.length; j++) {
        if (i == j) {
          overlapStart.push(i);
          continue;
        }
        else if ((thisDayEvents[i].start >= thisDayEvents[j].start && thisDayEvents[i].start < thisDayEvents[j].end)
            && (thisDayEvents[i].start.toDateString() == thisDayEvents[j].start.toDateString() && thisDayEvents[i].end.toDateString() == thisDayEvents[j].end.toDateString())) {
          overlapStart.push(j);
          //overlapCount++;
        }
      }
      
      for (var j = 0; j < thisDayEvents.length; j++) {
        if (i == j) {
          overlapEnd.push(i);
          continue;
        }
        else if ((thisDayEvents[i].end > thisDayEvents[j].start && thisDayEvents[i].end <= thisDayEvents[j].end)
            && (thisDayEvents[i].start.toDateString() == thisDayEvents[j].start.toDateString() && thisDayEvents[i].end.toDateString() == thisDayEvents[j].end.toDateString())) {
          overlapEnd.push(j);
        }
      }
      
      for (var j = 0; j < thisDayEvents.length; j++) {
        if (i == j) {
          overlapMid.push(i);
          continue;
        }
        else if ((thisDayEvents[i].start <= thisDayEvents[j].start && thisDayEvents[i].end >= thisDayEvents[j].end)
            && (thisDayEvents[i].start.toDateString() == thisDayEvents[j].start.toDateString() && thisDayEvents[i].end.toDateString() == thisDayEvents[j].end.toDateString())) {
          overlapMid.push(j);
        }
      }
      
      var width = 98 / Math.max(overlapStart.length, overlapEnd.length);
      
      if (thisDayEvents[i].width == null)
        thisDayEvents[i].width = width;
      else if (thisDayEvents[i].width > width)
        thisDayEvents[i].width = width;
    
      var bigOverlap = ((overlapStart.length > overlapEnd.length) ? overlapStart : overlapEnd);
        
      var index = bigOverlap.indexOf(i);
      
      for (var j = 0; j < bigOverlap.length; j++) {
        if (thisDayEvents[bigOverlap[j]].width > width)
          thisDayEvents[bigOverlap[j]].width = width;
      }
      
      thisDayEvents[i].left = (index > 0) ? thisDayEvents[bigOverlap[index - 1]].left + thisDayEvents[bigOverlap[index - 1]].width : 0;
    }
    
    for (var i = 0; i < thisDayEvents.length; i++) {
      setDayEvent(thisDayEvents[i], $parent);
    }
    dispatchEvent(configs.onDataBound);
  };

  renderFooter = function () {
  };

  clearBody = function () {
    $currentView.empty();
  };

  prevView = function () {
    dispatchEvent(configs.onPreviousView);
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
    dispatchEvent(configs.onNextView);
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
  
  gotoDay = function (dt) {
    var targetDate = new Date(dt);
    renderDate = targetDate;
    setDayMode();
  };

  setMonthEvent = function (event, $parent = $('.sc .sc-month-body')) {
    var start = new Date(event.start),
      end = new Date(event.end),
      title = event.title,
      $divEvent = $(document.createElement('div'));
      $divEvent.addClass('sc-event-item');
      $divEvent.attr('data-identity', event.$id);
      $divEvent.attr('draggable', true);
      $divEvent.html('<span>' + formatNumber(start.getHours()) + ':' + formatNumber(start.getMinutes()) + '</span> <span>' + title + '</span>');

    if (start.toDateString() == end.toDateString()) {
      var $startTd = $parent.find('td[data-date="' + start.toDateString() + '"]');
      if($startTd.html() == '' && $startTd.css('display') != 'none') {
        $divEvent.addClass('sc-event-first-item');
        $startTd.append($divEvent);
      }
      else {
        var colIndex = $startTd[0].cellIndex;
        var $parentTable = $startTd.closest('table');
        var foundEmpty = false;

        $parentTable.find('td:nth-child(' + (colIndex + 1) + ')').each(function() {
          if ($(this).html() == '' && $(this).css('display') != 'none') {
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
      var $startTd = $parent.find('td[data-date="' + start.toDateString() + '"]');
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
        $startTd = $parent.find('td[data-date="' + trueStart.toDateString() + '"]');
        if ($startTd.length == 0) {
          break;
        }
        var $parentTable = $startTd.closest('table');
        var colIndex = $startTd[0].cellIndex;

        var row = $parentTable[0].rows[$startTd[0].closest('tr').rowIndex];

        for (var i = colIndex, cell; cell = row.cells[i]; i++) {
          if ($(cell).html() != '' || $(cell).css('display') == 'none') {
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
                $divEvents.attr('data-identity', event.$id);
                $divEvents.attr('draggable', true);
                $divEvents.css({ top: newRow.rowIndex * -1.6 });
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
                $divEvents.attr('draggable', true);
                $divEvents.attr('data-identity', event.$id);
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
      $divEvent.attr('data-identity', event.$id);
      $divEvent.attr('draggable', true);
    
    if (start.toDateString() == end.toDateString()) {
      $divEvent.html('<span>' + formatNumber(start.getHours()) + formatNumber(start.getMinutes())
	    + ' - ' + formatNumber(end.getHours()) + formatNumber(end.getMinutes()) + '</span><span>' + title + '</span>');
      $divEvent.addClass('sc-time-event-item');
      var startPosition = start.getHours() * 40;
      startPosition += Math.round((start.getMinutes() / 60) * 40);
      var eventHeight = Math.round(hoursBetween(start, end) * 40);
      
      $divEvent.css({ top: startPosition + 'px', height: eventHeight + 'px', width: event.width + '%', left: event.left + '%' });
      
      var colIndex = $('.sc .sc-week-head').find('div[data-date="' + start.toDateString() + '"]').index();
      
      var $column = $parent.find('.sc-time-event > .sc-table-row').children().eq(colIndex);
      
      $column.append($divEvent);
    } 
    else {
      $divEvent.html('<span>' + title + '</span>');
      $divEvent.addClass('sc-event-item');
	  
      var startColIndex = $('.sc .sc-week-head').find('div[data-date="' + start.toDateString() + '"]').index();
      var endColIndex = $('.sc .sc-week-head').find('div[data-date="' + end.toDateString() + '"]').index();
      
      if (startColIndex != -1) {
      }
      else {
        startColIndex = 1;
      }
      
      if (endColIndex != -1) {
      }
      else {
        endColIndex = 7;
      }
      
      if (end.getHours() == 0 && end.getMinutes() == 0) {
        endColIndex--;
      }
      
      var $parentTable = $('.sc .sc-all-day-event');
      var foundEmpty;
      
      var table = $parentTable[0];
      for (var i = 0, row; row = table.rows[i]; i++) {
        //iterate through rows
        //rows would be accessed using the "row" variable assigned in the for loop
        foundEmpty = true;
        for (var j = startColIndex, cell; cell = row.cells[j]; j++) {
          //iterate through columns
          //columns would be accessed using the "cell" variable assigned in the for loop
          if ($(cell).html() != '' || $(cell).css('display') == 'none') {
            foundEmpty = false;
          }
          if (endColIndex == j) {
            break;
          }
        }
        
        if (foundEmpty) {
          var colspan = endColIndex - startColIndex + 1;
          for (var j = startColIndex, cell; cell = row.cells[j]; j++) {
            if (endColIndex == j) {
              $(cell).append($divEvent);
              $(cell).attr('colspan', colspan);
              break;
            }
            else {
              $(cell).hide();
            }
          }
          break;
        }
      }
      
      if (!foundEmpty) {
        var newRow = $parentTable[0].insertRow($parentTable[0].rows.length);
        
        for (i = 0; i < 8; i++) {
          var cell = newRow.insertCell(i);
          var colspan = endColIndex - startColIndex + 1;
          
          if (i == endColIndex) {
            $(cell).append($divEvent);
            $(cell).attr('colspan', colspan);
          }
          else if (i >= startColIndex) {
            $(cell).hide();
          }
        }
      }
      
      $('.sc .sc-all-day-wrapper').css({ height: ($parentTable[0].rows.length * 22) + 'px' });
    }
  };
  
  setDayEvent = function (event, $parent = $('.sc .sc-week-body')) {
    var start = new Date(event.start),
      end = new Date(event.end),
      title = event.title,
      $divEvent = $(document.createElement('div'));
      $divEvent.attr('data-identity', event.$id);
      $divEvent.attr('draggable', true);
    
    if (start.toDateString() == end.toDateString()) {
      $divEvent.html('<span>' + formatNumber(start.getHours()) + formatNumber(start.getMinutes()) 
	    + ' - ' + formatNumber(end.getHours()) + formatNumber(end.getMinutes()) + '</span><span>' + title + '</span>');
      $divEvent.addClass('sc-time-event-item');
      var startPosition = start.getHours() * 40;
      startPosition += Math.round((start.getMinutes() / 60) * 40);
      var eventHeight = Math.round(hoursBetween(start, end) * 40);
      
      $divEvent.css({ top: startPosition + 'px', height: eventHeight + 'px', width: event.width + '%', left: event.left + '%' });
      
      var $column = $parent.find('.sc-time-event > .sc-table-row').children().eq(1);
      
      $column.append($divEvent);
    }
    else {
      if (end.getHours() == 0 && end.getMinutes() == 0 && $('.sc .sc-day-head').find('div[data-date="' + end.toDateString() + '"]').length == 1) {
        return;
      }
      
      $divEvent.html('<span>' + title + '</span>');
      $divEvent.addClass('sc-event-item');
      var $parentTable = $('.sc .sc-all-day-event');
      
      var $cell = $($parentTable[0].rows[0].cells[1]);
      $cell.append($divEvent);
      
      $('.sc .sc-all-day-wrapper').css({ height: ($cell.children().length * 24) + 'px' });
    }
  };
  
  processData = function () {
    configs.data = configs.data.map(function (item, index) {
      item.start = new Date(item.start);
      if (item.end) {
        item.end = new Date(item.end);
      }
      else {
        item.end = new Date(item.start);
        item.end.setHours(item.end.getHours() + 24);
      }
      item.$id = index;
      
      return item;
    });
    
    eventCount = configs.data.length;
    
    sortDataDesc();
  };
  
  sortDataDesc = function () {
    configs.data.sort(function(a, b) {
      var aHours = hoursBetween(new Date(a.start), new Date(a.end));
      var bHours = hoursBetween(new Date(b.start), new Date(b.end));
      
      return bHours - aHours;
    });
  };
  
  clearEvents = function () {
    if (configs.mode == 'month') {
      $('.sc-event-row-wrapper').each(function() {
        $(this).find('table tr:not(:first)').remove();
      });
      $('.sc-event-row-wrapper table tr td').each(function() {
        $(this).removeAttr('style');
        $(this).removeAttr('colspan');
        $(this).empty();
      });
    }
    else if (configs.mode == 'week') {
      $('.sc-all-day-event tr:not(:first)').remove();
      $('.sc-all-day-event tr td').each(function() {
        $(this).removeAttr('style');
        $(this).removeAttr('colspan');
        $(this).empty();
      });
      $('.sc-time-event-item').remove();
    }
    else if (configs.mode == 'day') {
      $('.sc-all-day-event tr:not(:first)').remove();
      $('.sc-all-day-event tr td').each(function() {
        $(this).removeAttr('style');
        $(this).removeAttr('colspan');
        $(this).empty();
      });
      $('.sc-time-event-item').remove();
    }
  };
  
  loadEvents = function () {
    if (configs.mode == 'month') {
      renderMonthEvent($('.sc-month-body > tr > td'), configs.data);
    }
    else if (configs.mode == 'week') {
      renderWeekEvent($('.sc-week-body > tr > td'), configs.data);
    }
    else if (configs.mode == 'day') {
      renderDayEvent($('.sc-day-body > tr > td'), configs.data);
    }
  };
  
  refreshEvents = function () {
    clearEvents();
    loadEvents();
  };
  
  addEvents = function (events) {
    dispatchEvent(configs.onDataAdd, { event: events });
    if (events instanceof Array) {      
      configs.data = configs.data.concat(events.map(function (item, index) {
        item.start = new Date(item.start);
        if (item.end) {
          item.end = new Date(item.end);
        }
        else {
          item.end = new Date(item.start);
          item.end.setHours(item.end.getHours() + 24);
        }
        item.$id = eventCount;
        eventCount++;
        
        return item;
      }));
    }
    else {
      events.$id = eventCount;
      eventCount++;
      events.start = new Date(events.start);
      if (events.end) {
        events.end = new Date(events.end);
      }
      else {
        events.end = new Date(events.start);
        events.end.setHours(events.end.getHours() + 24);
      }
      configs.data.push(events);
    }
    
    sortDataDesc();
    refreshEvents();
  };
  
  editEvent = function (event) {
    dispatchEvent(configs.onDataEdit, { event: event });
    var length = configs.data.length;
    for (var i = 0; i < length; i++) {
      if (event.$id == configs.data[i].$id) {
        configs.data[i].title = event.title;
        configs.data[i].start = new Date(event.start);
        if (event.end) {
          configs.data[i].end = new Date(event.end);
        }
        else {
          configs.data[i].end = new Date(event.start);
          configs.data[i].end.setHours(configs.data[i].end.getHours() + 24);
        }
        break;
      }
    }
    
    sortDataDesc();
    refreshEvents();
  };
  
  deleteEvent = function (event) {
    dispatchEvent(configs.onDataDelete, { event: event });
    var deletedEvent = configs.data.filter(function (el) {
      return el.$id == event.$id;
    });
    configs.data = configs.data.filter(function (el) {
      return el.$id != event.$id;
    });
    
    sortDataDesc();
    refreshEvents();
    
    return deletedEvent;
  }
  
  refreshHeader = function () {
    $('.sc-header').find('.sc-table-row-th > span.sc-header-day-text').each(function() {
      var index;
      var headerText = $(this).html();
      
      if (headerText.length > 3) {
        index = days.indexOf(headerText);
      }
      else {
        index = shortDays.indexOf(headerText);
      }
      
      $(this).html(getDayString(index));
    });
  };

  getDayString = function (day) {
    return (shortDisplay ? shortDays[day] : days[day]);
  };

  getMonthString = function (month) {
    return (shortDisplay ? shortMonths[month] : months[month]);
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
    return (Math.abs(treatAsUTC(startDate) - treatAsUTC(endDate)) / 36e5);
  };
  
  formatNumber = function (n) {
	return (n < 10) ? ('0' + n) : n;
  };
  
  mediaQuery.addListener(function(e){
    if (shortDisplay != e.matches) {
      shortDisplay = e.matches;
      refreshToolbarTitle();
      refreshHeader();
    }
    else {
      shortDisplay = e.matches;
    }
  });
  
  dispatchEvent = function (e) {
    if (typeof e == 'function') {
      e.apply(this, Array.prototype.slice.call(arguments, 1));
    }
  };
  
  source = {
    load: function () {
      this.read(this.afterRead);
    },
    
    read: function (response) {
      response(configs.data);
    },
    
    afterRead: function (data) {
      configs.data = data;
      processData();
      refreshEvents();
    }
  };
  
  eventDragStart = function (e) {
    var indentity = $(this).attr('data-identity');
    $('[data-identity=' + indentity + ']').addClass('dragged');
    setTimeout(function () { $('.sc .sc-view').addClass('dragging'); }, 100);
    eventDragging = configs.data.filter(function (el) {
      return el.$id == indentity;
    })[0];
  };
  
  eventDragEnter = function (e) {
    if (eventDragging) {
      $(this).addClass('drag-over');
      var colIndex = $(this).index();
      var rowIndex = $(this).closest('.sc-week-row').index();
      var days = daysBetween(eventDragging.start.toDateString(), eventDragging.end.toDateString()) + 1;
      $('.drag-over').removeClass('drag-over');
      while (days > 0) {
        var $row = $('.sc .sc-week-row').eq(rowIndex);
        
        if ($row.length == 0) {
          break;
        }
        
        var $col = $row.find('.sc-week-row-wrapper .sc-day').eq(colIndex);
        $col.addClass('drag-over');
        
        if (colIndex == 6) {
          colIndex = 0;
          rowIndex++;
        }
        else {
          colIndex++;
        }
        days--;
      }
    }
  };
  
  eventDragOver = function (e) {
    e.preventDefault();
  };
  
  eventDragLeave = function (e) {
  };
  
  eventDragEnd = function (e) {
    $('[data-identity=' + $(this).attr('data-identity') + ']').removeClass('dragged');
    $('.drag-over').removeClass('drag-over');
    $('.sc .sc-view').removeClass('dragging');
    eventDragging = null;
  };
  
  eventDrop = function (e) {
    if (eventDragging) {
      if (eventDragging.start.toDateString() != $(this).attr('data-date')) {
        var newStart = $(this).attr('data-date');
        var days = daysBetween(eventDragging.start.toDateString(), eventDragging.end.toDateString());
        
        eventDragging.start = new Date(newStart  + ' ' + eventDragging.start.toTimeString());
        eventDragging.end = new Date(newStart  + ' ' + eventDragging.end.toTimeString());
        eventDragging.end.setDate(eventDragging.end.getDate() + days);
        console.log(eventDragging);
        editEvent(eventDragging);
        
        $('.drag-over').removeClass('drag-over');
        $('.sc .sc-view').removeClass('dragging');
      }
    }
  };

  init();

  return {
    element: element,
    refreshView: refreshView,
    prevView: prevView,
    nextView: nextView,
    addEvents: addEvents,
    editEvent: editEvent,
    deleteEvent: deleteEvent,
    source: {
      load: source.load
    }
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
