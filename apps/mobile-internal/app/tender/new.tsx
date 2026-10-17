import { Stack, router } from "expo-router";
import { useState } from "react";

import { Body, Field, FormError, PrimaryButton, Screen, Title } from "@/src/kit";
import { saveDraft } from "@/src/queries";

export default function NewTenderScreen() {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [closing, setClosing] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function save() {
    const rands = Number(budget.replace(/,/g, ""));
    if (!title.trim() || !department.trim()) {
      setError("Enter a title and a department.");
      return;
    }
    if (!Number.isFinite(rands) || rands < 0) {
      setError("Enter the budget in rands.");
      return;
    }
    const id = await saveDraft({
      title: title.trim(),
      department: department.trim(),
      category: category.trim(),
      description: description.trim(),
      budgetCents: Math.round(rands * 100),
      closingAt: closing ? new Date(`${closing}T16:00:00`).toISOString() : new Date().toISOString(),
    });
    if (!id) {
      setError("Could not save this draft.");
      return;
    }
    router.replace(`/tender/${id}`);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "New draft" }} />
      <Title>New draft</Title>
      <Body>Saves a draft. Nothing is published until the status changes.</Body>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Department" value={department} onChangeText={setDepartment} />
      <Field label="Category" value={category} onChangeText={setCategory} />
      <Field label="Budget (ZAR)" value={budget} onChangeText={setBudget} />
      <Field label="Closing date" value={closing} onChangeText={setClosing} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      {error ? <FormError>{error}</FormError> : null}
      <PrimaryButton label="Save draft" onPress={() => void save()} />
    </Screen>
  );
}
