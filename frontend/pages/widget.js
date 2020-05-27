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

function TextWidget({ events }) {
  const value = last(events, {}).data;
  return <WidgetText>{value ? prettifyData(value) : "---"}</WidgetText>;
}

function formatDate(date) {
  const d = new Date(date);
  return `${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function LineWidget({ events, opts }) {
  const formatter = (value, name, props) => prettifyData(value);
  const { xDomain, yDomain, scale } = opts;
  // todo import scss colors
  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <LineChart data={events}>
        <Line type="monotone" dataKey="data" stroke="#f03009" dot={false} />
        <XAxis
          dataKey={v => v.time.getTime()}
          tickFormatter={formatDate}
          interval="preserveStartEnd"
          scale="linear"
          domain={xDomain || ["auto", "auto"]}
        />
        <YAxis
          domain={yDomain || ["auto", "auto"]}
          interval="preserveStartEnd"
          scale={scale || "auto"}
        />
        <Tooltip formatter={formatter} labelFormatter={formatDate} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const types = {
  hr: {
    title: "Heart Rate",
    units: "bpm",
    display: "line",
    yDomain: [min => Math.min(min - 10, 40), max => Math.max(max + 20, 150)],
    scale: "linear",
  },
  awair_score: {
    title: "Awair Score",
    display: "line",
    yDomain: [min => Math.min(min - 10, 50), 100],
  },
  co2: {
    title: "CO2",
    units: "ppm",
    display: "line",
  },
  temp: {
    title: "Temperature",
    units: "°F",
    display: "line",
  },
  voc: {
    title: "VOC",
    units: "ppb",
    display: "line",
  },
  humid: {
    title: "Humidity",
    units: "%",
    display: "line",
  },
};

const widgetDisplays = {
  line: LineWidget,
};

export const typeOrder = Object.keys(types);

export default function Widget(props) {
  const type = props.type;
  const events = props.events || [];

  if (!types[type]) {
    return null;
  }

  const opts = types[type];
  const { title, units, display } = opts;
  const DisplayTag = widgetDisplays[display];

  if (!DisplayTag) {
    return null;
  }

  return (
    <WidgetWrapper>
      <h2>
        {title}
        {units ? ` (${units})` : ""}
      </h2>
      <DisplayTag events={events} opts={opts}></DisplayTag>
    </WidgetWrapper>
  );
}
