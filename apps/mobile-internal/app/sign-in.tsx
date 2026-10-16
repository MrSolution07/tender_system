import { DESK_PEOPLE, ROLE_LABEL, type DeskRole } from "@tender/fixtures";
import { useRef, useState } from "react";
import { TextInput } from "react-native";

import {
  Choice,
  Field,
  FormError,
  Heading,
  Meta,
  PrimaryButton,
  SectionSub,
  SectionTitle,
  SignInFrame,
} from "@/src/kit";
import { useSession } from "@/src/session";

const SAMPLE_PASSWORD = "preview";

const ACCOUNTS: { email: string; role: DeskRole }[] = [
  {
    email: "thandi.mokoena@majortech.example",
    role: "procurement_officer",
  },
  {
    email: "johan.pietersen@majortech.example",
    role: "evaluator",
  },
  {
    email: "ayesha.khan@majortech.example",
    role: "super_admin",
  },
];

export default function SignInScreen() {
  const { enter } = useSession();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  function submit(nextEmail = email, nextPassword = password) {
    const cleaned = nextEmail.trim().toLowerCase();
    const nextEmailError = cleaned.includes("@") ? "" : "Enter a work email.";
    const nextPasswordError = nextPassword ? "" : "Enter the password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");
    if (nextEmailError || nextPasswordError) return;
    const account = ACCOUNTS.find((item) => item.email === cleaned);
    if (!account) {
      setFormError("No sample account uses that email.");
      return;
    }
    if (nextPassword !== SAMPLE_PASSWORD) {
      setFormError("That password does not match the sample account.");
      return;
    }
    enter(account.role);
  }

  return (
    <SignInFrame product="Procurement desk">
      <SectionTitle>Sign in</SectionTitle>
      <SectionSub>
        Sample sign-in. Password is preview. Nothing is sent.
      </SectionSub>
      <Field
        label="Work email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setEmailError("");
          setFormError("");
        }}
        error={emailError}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="username"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setPasswordError("");
          setFormError("");
        }}
        error={passwordError}
        secure
        autoComplete="current-password"
        textContentType="password"
        autoCapitalize="none"
        inputRef={passwordRef}
        returnKeyType="done"
        onSubmitEditing={() => submit()}
      />
      {formError ? <FormError>{formError}</FormError> : null}
      <PrimaryButton label="Sign in" onPress={() => submit()} />
      <Heading>Sample accounts</Heading>
      {ACCOUNTS.map((account) => (
        <Choice
          key={account.role}
          title={DESK_PEOPLE[account.role]}
          meta={`${ROLE_LABEL[account.role]}. ${account.email}`}
          onPress={() => {
            setEmail(account.email);
            setPassword(SAMPLE_PASSWORD);
            setEmailError("");
            setPasswordError("");
            setFormError("");
          }}
        />
      ))}
      <Meta>Fills the form. Sign in still has to be pressed.</Meta>
    </SignInFrame>
  );
}
