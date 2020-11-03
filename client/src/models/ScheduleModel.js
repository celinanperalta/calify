
class ScheduleModel {

    constructor(name, time_zone) {
        this.name = name;
        this.time_zone = time_zone;
        this.created_date = new Date();
        this.last_updated_date = this.created_date;
        this.playlist_rows = [];
    }

}