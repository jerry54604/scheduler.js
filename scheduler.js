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

      return (start >= calendarStartDate && start <= calendarEndDate) || (end >= calendarStartDate && end <= calendarEndDate);
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

    for (var i = 0; i < 7; i++) {
      $tdAllDay = $(document.createElement('div'));
      $tdAllDay.addClass('sc-table-row-td');
      $trAllDay.append($tdAllDay);
    }

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
    $parent.append($divTimeBody);
  };

  renderDay = function (data) {
    var $divWrapper = $(document.createElement('div'));
    $divWrapper.addClass('sc-day-wrapper');

    var $tblCalendar = $(document.createElement('table'));
    var $thdCalendar = $(document.createElement('thead'));
    $thdCalendar.addClass('sc-day-head');
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
  }

  daysBetween = function (startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
  }

  init();

  return {
    element: element,
    refreshView: refreshView,
    prevView: prevView,
    nextView: nextView,
    setMonthEvent: setMonthEvent
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
