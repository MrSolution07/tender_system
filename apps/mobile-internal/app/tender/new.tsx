import { Stack } from "expo-router";
import { useState } from "react";

import { Body, Field, PrimaryButton, Screen, Title } from "@/src/kit";

export default function NewTenderScreen() {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [closing, setClosing] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Screen>
      <Stack.Screen options={{ title: "New draft" }} />
      <Title>New draft</Title>
      <Body>Fill the form. Save only opens a preview notice.</Body>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Department" value={department} onChangeText={setDepartment} />
      <Field label="Category" value={category} onChangeText={setCategory} />
      <Field label="Budget (ZAR)" value={budget} onChangeText={setBudget} />
      <Field label="Closing date" value={closing} onChangeText={setClosing} />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <PrimaryButton label="Save draft" href="/held?kind=draft" />
    </Screen>
  );
}
