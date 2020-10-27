import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import '../App.css';
import moment from 'moment'

function ListItemLink(props) {
  return <ListItem button component = "a" {...props}/>;
}

class PlaylistRow extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }
    componentDidMount() {
        // this.setState({
        //     start_time: new Date().toLocaleTimeString(),
        //     end_time: new Date((new Date().getTime() + 1800000)).toLocaleTimeString()
        // })
    }
    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    tick() {
        // this.setState({
        //     time: new Date().toLocaleString()
        // });
    }
    
    render () {
    return (
        <ListItem key={this.props.id}>
            <Grid container
                direction = "row"
                justify = "center"
                alignItems = "center"
                spacing={3}>
                
            <Grid item xs={3}>
                    <Select
                        width="25ch"
                        className="RowInput"
                        name="name"
                        value={this.props.name}
                        onChange = {this.props.onChange}>
                    {this.props.playlists.map((d) =>
                        <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                    )}
                </Select>
            </Grid>

            <Grid item xs={3}>
                <TextField
                    className="RowInput"
                    label="Start Time"
                    type="time"
                    name="start_time"
                    value={this.props.start_time}
                    variant="outlined"
                    inputProps={{
                        step: 150,
                        }}
                    onChange = {this.props.onChange}
                    />
            </Grid>

            <Grid item xs={3}>
                <TextField
                    className = "RowInput"
                    label="End Time"
                    type="time"
                    name = "end_time"
                    value = {this.props.end_time}
                    variant="outlined"
                    inputProps={{
                    step: 150,
                        }}
                    onChange = {this.props.onChange}
                    />
            </Grid>

            <Grid item xs={3}>
                <ListItemSecondaryAction onClick = {
                    this.props.onDelete} >
                    <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            </Grid>
        </Grid>
      </ListItem>
   )};
}

export default PlaylistRow;