import React, { useEffect, useState } from 'react';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

export default function BottomNavigator(props) {
    return <Card style={{
        paddingLeft: 10,
        paddingRight: 10
    }}>
        <Grid container spacing={0} justify='space-between'>
            <IconButton>
                <i className="material-icons" > arrow_back_ios </i> </IconButton >
            <IconButton>
                <i className="material-icons" > arrow_forward_ios </i> </IconButton >
            <IconButton>
                <i className="material-icons" > find_replace </i> </IconButton >
            <IconButton>
                <i className="material-icons" > check_box_outline_blank </i> </IconButton >
            <IconButton>
                <i className="material-icons" > more_horiz </i> </IconButton >
        </Grid>
    </Card>
}