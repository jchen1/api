import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { last, prettifyData } from "./util";

function TextWidget({ value }) {
  return <p>{value ? prettifyData(value) : "---"}</p>;
}

const types = {
  hr: {
    title: "Heart Rate (bpm)",
    display: events => <TextWidget value={last(events, {}).data}></TextWidget>,
  },
  awair_score: {
    title: "Awair Score",
    display: events => <TextWidget value={last(events, {}).data}></TextWidget>,
  },
  co2: {
    title: "CO2 (ppm)",
    display: events => <TextWidget value={last(events, {}).data}></TextWidget>,
  },
  temp: {
    title: "Temperature (°F)",
    display: events => <TextWidget value={last(events, {}).data}></TextWidget>,
  },
  voc: {
    title: "VOC (ppb)",
    display: events => <TextWidget value={last(events, {}).data}></TextWidget>,
  },
  humid: {
    title: "Humidity (%)",
    display: events => <TextWidget value={last(events, {}).data}></TextWidget>,
  },
  all: {
    title: "Events Received",
    display: events => <TextWidget value={events.length}></TextWidget>,
  },
};

const WidgetWrapper = styled.div``;

export default function Widget(props) {
  const type = props.type;
  const events = props.events || [];

  if (!types[type]) {
    return <></>;
  }

  const display = types[type].display(events);

  return (
    <WidgetWrapper key={type}>
      <h2>{types[type].title}</h2>
      {display}
    </WidgetWrapper>
  );
}
