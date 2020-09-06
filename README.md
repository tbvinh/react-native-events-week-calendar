# react-native-events-week-calendar

## Getting started

`$ npm install react-native-events-week-calendar --save`

### Mostly automatic installation

`$ react-native link react-native-events-week-calendar`

## Images
![Image of Sample](https://github.com/tbvinh/react-native-events-week-calendar/raw/master/example/demo-sm.gif)

## Usage
```javascript
import { VCalendar } from 'react-native-events-week-calendar';

...
<VCalendar
          onNewEvent={this.onNewEvent}
          onClickEvent={this.onClickEvent}
          columnHeaders={headers}
          title="My Title"
          hourStart={8}
          hourEnd={17}
          showHourStart={7}
        />
...


// TODO: What to do with the module?

```
