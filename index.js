import React from 'react';
import bind from 'memoize-bind';
import {
    Dimensions, StyleSheet, ScrollView, View, Text, Animated, TouchableOpacity, TouchableNativeFeedback
    , ActivityIndicator, Modal, TouchableHighlight
}
    from 'react-native';
import populateEvents from './packer';
import moment from 'moment';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const formatTime = 'hh:mm A';
const TEXT_LINE_HEIGHT = 17;

export class VCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            title: props.title??'',
            timeHeight: SCREEN_HEIGHT,
            columnPackedHeaders: [],
            lines: [],
            times: [],
            dataEvents: [],
            hourStart: props.hourStart ?? 8,
            hourEnd: props.hourEnd ?? 20,
            showHourStart: props.showHourStart ?? 8,
        }

        this.header = null;
        this.eventsGrid = null;

        this.eventsGridScrollX = new Animated.Value(0);
        this.columnHeaders = props.columnHeaders;

        this.columnPress = this.columnPress.bind(this);
    }
    headerRef = (ref) => {
        this.header = ref;
    };
    eventsGridRef = (ref) => {
        this.eventsGrid = ref;
    };
    onClickEvent(item) {

        // const msg = `${item.title}\n${item.summary}\n\n${item.start} - ${item.end}`
        // console.log(item)
        //alert(msg)
        if(this.props.onClickEvent){
            this.props.onClickEvent(item)
        }
        //alert(msg)
    }
    columnPress(event, index) {
        //  console.log(event)
        const { locationY } = event.nativeEvent
        // console.log(locationY)
        // console.log("NEW EVENT => modalVisible => " + this.state.modalVisible)

        // //this.setState({ modalVisible: true })
        // const msg = {Column: this.columnHeaders[index].Title, Hours: this.yToHour(locationY)}
        // console.log(msg)
        
        //alert(`\nColumn: ${this.columnHeaders[columnIdx].Title}\nHours:` + this.yToHour(locationY))
        if (this.props.onNewEvent) {
            this.props.onNewEvent({index, Title:this.columnHeaders[index].Title, hours: this.yToHour(locationY)})
        }
    }
    componentDidMount() {
        this.eventsGridScrollX.addListener((position) => {
            this.header.scrollTo({ x: position.value, animated: false });
        });
        this.loadData()

    }

    componentWillUnmount() {
        this.eventsGridScrollX.removeAllListeners();
    }
    cancelAlertBox = (visible) => {
        this.setState({ modalVisible: visible });
    }
    yToHour = (y) => {
        const val = (y - 10) / 120
        const hour = parseInt(val);
        const prac = Math.round(parseFloat(val - parseInt(val)) * 10)
        var ret = {}
        if (prac < 3) {
            ret = { 'from': `${hour}:00`, 'to': `${hour}:15` }
        } else if (prac < 6) {
            ret = { 'from': `${hour}:15`, 'to': `${hour}:30` }
        } else if (prac < 9) {
            ret = { 'from': `${hour}:30`, 'to': `${hour}:45` }
        } else {
            ret = { 'from': `${hour}:45`, 'to': `${hour + 1}:00` }
        }

        return ret;
    };



    scrollToFirst() {
        const { showHourStart } = this.state
        setTimeout(() => {
            if (this._scrollView) {
                this._scrollView.scrollTo({
                    x: 0,
                    y: showHourStart * 120,
                    animated: true,
                });
            }
        }, 1);
    }

    getPackedEvents(items, hourStart) {
        const width = SCREEN_WIDTH / 3 - 30;
        const userEvents = []
        const events = populateEvents(items.events, width, hourStart)
        events.map((item, index) => {
            //console.log(item)
            const numberOfLines = Math.floor(item.height / TEXT_LINE_HEIGHT);
            userEvents.push(
                <TouchableOpacity key={`userEvents${index}`} onPress={bind(this.onClickEvent, this, item)} id={index}
                    style={[{
                        left: item.left + 5, height: item.height, top: item.top + 10, width: item.width + 5,
                        backgroundColor: '#CCDDCC', opacity: 0.9, color: '#615B73',
                        position: 'absolute', padding: 4, borderRadius: 5
                    }]}
                >
                    <Text numberOfLines={1}>{item.title || 'Event'}</Text>
                    {numberOfLines > 1 ? (
                        <Text
                            numberOfLines={numberOfLines - 1}
                            style={[styles.eventSummary]}
                        >
                            {item.summary || ' '}
                        </Text>
                    ) : null}
                    {numberOfLines > 2 ? (
                        <Text style={styles.eventTimes} numberOfLines={1}>
                            {moment(item.start).format(formatTime)} -{' '}
                            {moment(item.end).format(formatTime)}
                        </Text>
                    ) : null}

                </TouchableOpacity>
            )
        })
        return userEvents
    }

    loadData = async () => {
        console.log('loadData')

        const { hourStart, hourEnd } = this.state

        const times = []
        let timeHeight = 10;
        let textColor = '#FFFFFF'

        for (var index = 0; index <= 23; index++) {
            var top = 120 * (index)
            timeHeight += 120
            if (index < hourStart || index > hourEnd) {
                textColor = 'lightgray'
            } else {
                textColor = 'black'
            }
            times.push(
                <View style={[{ top: top, position: 'absolute', flex: 1, alignSelf: 'flex-end', }]}
                    key={`times${index}`}
                >
                    <Text style={{ marginRight: 4, fontWeight: 'bold', color: textColor }} >{`${index}:00`}</Text>
                </View>,
                <View style={[{ top: top + 30, position: 'absolute', flex: 1, alignSelf: 'flex-end', }]}
                    key={`timesA${index}`}
                >
                    <Text style={{ marginRight: 4, color: textColor }} >15</Text>
                </View>,
                <View style={[{ top: top + 60, position: 'absolute', flex: 1, alignSelf: 'flex-end', }]}
                    key={`timesB${index}`}
                >
                    <Text style={{ marginRight: 4, color: textColor }} >30</Text>
                </View>,
                <View style={[{ top: top + 90, position: 'absolute', flex: 1, alignSelf: 'flex-end', }]}
                    key={`timesC${index}`}
                >
                    <Text style={{ marginRight: 4, color: textColor }} >45</Text>
                </View>
            )
        }
        const columnHeaders = []
        this.columnHeaders.map((item, index) => {
            columnHeaders.push(
                <View style={styles.header} key={`header${index}`}>
                    <Text>{item.Title}</Text>
                </View>
            )
        })

        const lines = []
        for (var i = 0; i <= 23; i++) {
            var top = 120 * i + 10
            lines.push(
                <View
                    key={`line${i}`}
                    style={[styles.line2, { top: top, width: SCREEN_WIDTH }]}
                />,
                <View
                    key={`lineA${i}`}
                    style={[styles.line, { top: top + 30, width: SCREEN_WIDTH }]}
                />,
                <View
                    key={`lineB${i}`}
                    style={[styles.line, { top: top + 60, width: SCREEN_WIDTH }]}
                />,
                <View
                    key={`lineC${i}`}
                    style={[styles.line, { top: top + 90, width: SCREEN_WIDTH }]}
                />,
            )
        }

        const dataEvents = []
        this.columnHeaders.map((item, index) => {
            if (item.events) {
                dataEvents.push(
                    <TouchableNativeFeedback id={index} onPress={(event) => this.columnPress(event, index)} key={`dataTouch${index}`}>
                        <View style={styles.events} key={`data${index}`}>
                            {this.getPackedEvents(item, 0) /*hourStart*/}
                        </View>
                    </TouchableNativeFeedback>
                )
            } else {
                dataEvents.push(
                    <TouchableNativeFeedback onPress={(event) => this.columnPress(event, index)} key={`dataTouch${index}`}>
                        <View style={styles.events} key={`data${index}`}>
                            {/* Empy List */}
                        </View>
                    </TouchableNativeFeedback>
                )
            }
        })
        this.setState({ loading: false, timeHeight, columnPackedHeaders: columnHeaders, lines, times, dataEvents },
            () => this.scrollToFirst())

    }
    render() {
        const { modalVisible } = this.state
        return (
            <>
                {this.state.loading ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                        <ActivityIndicator color={'#blue'} />
                    </View>
                    :
                    <View style={styles.container}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text>XXX</Text>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text>Y</Text>
                            </View>
                        </View>
                        <View style={styles.headerContainer}>
                            <View style={styles.fixedColumn2}>
                                <Text >{this.state.title}</Text>
                            </View>
                            <ScrollView
                                horizontal
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                automaticallyAdjustContentInsets={false}
                                ref={this.headerRef}
                            >

                                {this.state.columnPackedHeaders}
                            </ScrollView>
                        </View>


                        <ScrollView ref={ref => (this._scrollView = ref)}
                            showsHorizontalScrollIndicator={false}
                            automaticallyAdjustContentInsets={false}
                        >
                            <View style={styles.scrollViewContent}>
                                <View style={[{ ...styles.fixedColumn, height: this.state.timeHeight }]}>
                                    {this.state.lines}
                                    {this.state.times}
                                </View>
                                <ScrollView horizontal
                                    showsHorizontalScrollIndicator={false}
                                    automaticallyAdjustContentInsets={false}
                                    onScroll={Animated.event(
                                        [
                                            {
                                                nativeEvent: {
                                                    contentOffset: {
                                                        x: this.eventsGridScrollX,
                                                    },
                                                },
                                            },
                                        ],
                                        { useNativeDriver: false },
                                    )
                                    }
                                    ref={this.eventsGridRef}

                                >

                                    {this.state.dataEvents}

                                </ScrollView>
                            </View>
                        </ScrollView>
                        
                    </View>
                }</>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    centeredView: {
        //   flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    scrollViewContent: {
        flexDirection: 'row',
    },
    headerContainer: {
        flexDirection: 'row',
    },
    fixedColumn: {
        width: 70,
        //flex: 1,
        //flexDirection: 'row',
        //  height: 1570,
    },
    fixedColumn2: {
        width: 70,
        //height: 50,
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    events: {
        flex: 1,
        width: (SCREEN_WIDTH - 70) / 3,
        // alignItems: 'center',
        borderLeftWidth: 1,
        borderColor: 'rgb(216,216,216)',
    },
    header: {
        flex: 1,
        height: 50,

        //borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'rgb(216,216,216)',
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
        width: (SCREEN_WIDTH - 60) / 3,
    },
    line: {
        height: 1,
        position: 'absolute',
        left: 70,
        backgroundColor: 'rgb(216,216,216)',

    },
    line2: {
        height: 2,
        position: 'absolute',
        left: 70,
        backgroundColor: 'rgb(216,216,216)',

    },
    eventSummary: {
        color: '#615B73',
        fontSize: 12,
        flexWrap: 'wrap',
    },
    eventTimes: {
        marginTop: 3,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#615B73',
        flexWrap: 'wrap',
    }
});

