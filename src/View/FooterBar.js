import React, { useEffect, useState } from 'react';

export default function FooterBar(props) {
    if (props.type && props.type === 'choose') return <div style={{position: "fixed", bottom: 0, width: "100%"}} className={'BottomView'} ><p style={{ marginBlockEnd: 0 }}> Privacy Policy </p>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0 }}> Terms of use </p>
        <hr style={{
            color: 'white',
            backgroundColor: 'white',
            height: '0.5px'
        }} />
        <p style={{ textAlign: 'center', fontSize: 18 }} > InfiNet, LLC </p></div>
    return <div className={'BottomView'} ><p style={{ marginBlockEnd: 0 }}> Privacy Policy </p>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0 }}> Terms of use </p>
        <hr style={{
            color: 'white',
            backgroundColor: 'white',
            height: '0.5px'
        }} />
        <p style={{ textAlign: 'center', fontSize: 18 }} > InfiNet, LLC </p></div>
}