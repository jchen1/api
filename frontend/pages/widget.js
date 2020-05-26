import React from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { last, prettifyData } from "../lib/util";

const WidgetText = styled.h1`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WidgetWrapper = styled.div`
  width: 45%;
  flex-grow: 0;

  h2 {
    text-align: center;
  }

  @media screen and (max-width: 640px) {
    width: 100%;
  }
`;

function TextWidget({ value }) {
  return <WidgetText>{value ? prettifyData(value) : "---"}</WidgetText>;
}

function formatDate(date) {
  const d = new Date(date);
  return `${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function LineWidget({ events }) {
  const formatter = (value, name, props) => prettifyData(value);
  // todo import scss colors
  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <LineChart data={events.slice(events.length - 100)}>
        <Line type="monotone" dataKey="data" stroke="#f03009" dot={false} />
        <XAxis dataKey="time" tickFormatter={formatDate} />
        <YAxis />
        <Tooltip formatter={formatter} labelFormatter={formatDate} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const types = {
  hr: {
    title: "Heart Rate (bpm)",
    units: "bpm",
    display: events => <LineWidget events={events}></LineWidget>,
  },
  awair_score: {
    title: "Awair Score",
    display: events => <LineWidget events={events}></LineWidget>,
  },
  co2: {
    title: "CO2 (ppm)",
    units: "ppm",
    display: events => <LineWidget events={events}></LineWidget>,
  },
  temp: {
    title: "Temperature (°F)",
    units: "°F",
    display: events => <LineWidget events={events}></LineWidget>,
  },
  voc: {
    title: "VOC (ppb)",
    units: "ppb",
    display: events => <LineWidget events={events}></LineWidget>,
  },
  humid: {
    title: "Humidity (%)",
    units: "%",
    display: events => <LineWidget events={events}></LineWidget>,
  },
};

export const typeOrder = Object.keys(types);

export default function Widget(props) {
  const type = props.type;
  const events = props.events || [];

  if (!types[type]) {
    return null;
  }

  const display = types[type].display(events);

  return (
    <WidgetWrapper>
      <h2>{types[type].title}</h2>
      {display}
    </WidgetWrapper>
  );
}
