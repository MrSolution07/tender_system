import { APP_ROLES, type AppRole } from "@tender/shared";
import { ROLE_LABEL } from "@tender/fixtures";
import { useEffect, useState } from "react";

import { callAdmin, type Person } from "@/src/admin";
import {
  Body,
  Field,
  FormError,
  Page,
  PrimaryButton,
  QuietButton,
  SectionTitle,
} from "@/src/kit";
import { useSession } from "@/src/session";

export default function PeopleScreen() {
  const { session } = useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("procurement_officer");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [createdPassword, setCreatedPassword] = useState("");

  async function refresh() {
    const result = await callAdmin({ action: "list" });
    setMessage(result.error ?? "");
    if (!result.error) setPeople(result.people);
  }

  useEffect(() => {
    if (session?.role !== "super_admin") return;
    void refresh();
  }, [session?.role]);

  if (session?.role !== "super_admin") {
    return (
      <Page>
        <SectionTitle>People</SectionTitle>
        <Body>This desk is for a super admin.</Body>
      </Page>
    );
  }

  return (
    <Page>
      <SectionTitle>People</SectionTitle>
      <Body>Create an account and set its role. The password is shown once.</Body>
      <Field label="Name" value={fullName} onChangeText={setFullName} />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Field label="Department" value={department} onChangeText={setDepartment} />
      <Field label="Initial password" value={password} onChangeText={setPassword} autoCapitalize="none" />
      {APP_ROLES.map((item) => (
        <QuietButton key={item} label={ROLE_LABEL[item]} selected={role === item} onPress={() => setRole(item)} />
      ))}
      {role === "contractor" ? (
        <Field label="Company" value={companyName} onChangeText={setCompanyName} />
      ) : null}
      <PrimaryButton
        label="Create account"
        onPress={() => {
          if (password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            return;
          }
          if (role === "contractor" && !companyName.trim()) {
            setMessage("A contractor needs a company name.");
            return;
          }
          void callAdmin({
            action: "invite",
            fullName,
            email,
            department,
            password,
            role,
            companyName,
            registrationNumber: "",
          }).then(async (result) => {
            setMessage(result.error ?? "");
            setCreatedPassword(result.error ? "" : password);
            if (!result.error) {
              setFullName("");
              setEmail("");
              setPassword("");
              setCompanyName("");
              await refresh();
            }
          });
        }}
      />
      {createdPassword ? <Body>Give them this password once: {createdPassword}</Body> : null}
      {message ? <FormError>{message}</FormError> : null}
      {people.map((person) => (
        <Body key={person.id}>
          {person.fullName}. {person.email}. {ROLE_LABEL[person.role]}
          {person.disabled ? ". Disabled" : ""}
        </Body>
      ))}
    </Page>
  );
}
