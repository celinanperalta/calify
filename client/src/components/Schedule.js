import React, { Component } from "react";
import ScheduleDataService from "../services/ScheduleDataService";

export default class Schedule extends Component {
    constructor(props) {
        super(props);

        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.updateSchedule = this.updateSchedule.bind(this);
        this.deleteSchedule = this.deleteSchedule.bind(this);
        this.updateUpdateDate = this.updateUpdateDate.bind(this);

        this.state = {
            id: {
                name: "",
                time_zone: "",
                created_date: new Date(),
                last_updated_date: this.state.created_date,
                playlist_rows: []
            }
        }
    }

    componentDidMount() {
        //????
    }

    onChangeTitle(e) {
        const title = e.target.value;

        this.setState(function (prevState) {
            return {
                currentSchedule: {
                    ...prevState.currentSchedule,
                    title: title
                }
            }
        })
    }

    updateUpdateDate(e) {
        ScheduleDataService.update(this.state.id, {
            last_updated_date: new Date()
        }).then(() => {
            console.log("updated date?"); 
        });
    }

    updateSchedule(rows) {
        const data = {
            id: this.state.id,
            name: this.state.name,
            created_date: this.state.created_date,
            last_updated_date: new Date().toLocaleDateString(),
            playlist_rows: this.playlist_rows
        };

        ScheduleDataService.update(this.state.id, data).then(() => {
            console.log("updated schedule");
        }).catch((e) => {
            console.log(e);
        });

    }

    deleteSchedule() {
        ScheduleDataService.delete(this.state.id).then(() => {
            //update list?
        }).catch((e) => {
            console.log(e);
        });
    }

    render() {
        const { schedule } = this.state;
        return (<div></div>);
    }



}
