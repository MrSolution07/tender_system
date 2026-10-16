import { Redirect, router } from "expo-router";
import { useRef, useState } from "react";
import { TextInput } from "react-native";

import {
  Choice,
  Field,
  FormError,
  Heading,
  Meta,
  PrimaryButton,
  QuietButton,
  SectionSub,
  SectionTitle,
  SignInFrame,
} from "@/src/kit";
import { useSession } from "@/src/session";

const SAMPLE_PASSWORD = "preview";

const ACCOUNT = {
  email: "lerato.dlamini@umhlaba.example",
  name: "Lerato Dlamini",
  company: "Umhlaba Civils",
};

export default function SignInScreen() {
  const { session, enter } = useSession();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  if (session) return <Redirect href="/" />;

  function submit() {
    const nextEmail = email.trim().toLowerCase();
    const nextEmailError = nextEmail.includes("@") ? "" : "Enter a work email.";
    const nextPasswordError = password ? "" : "Enter the password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");
    if (nextEmailError || nextPasswordError) return;
    if (nextEmail !== ACCOUNT.email) {
      setFormError("No sample account uses that email.");
      return;
    }
    if (password !== SAMPLE_PASSWORD) {
      setFormError("That password does not match the sample account.");
      return;
    }
    enter();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <SignInFrame product="Government tender register">
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
        onSubmitEditing={submit}
      />
      {formError ? <FormError>{formError}</FormError> : null}
      <PrimaryButton label="Sign in" onPress={submit} />
      <Heading>Sample account</Heading>
      <Choice
        title={ACCOUNT.name}
        meta={`${ACCOUNT.company}. ${ACCOUNT.email}`}
        onPress={() => {
          setEmail(ACCOUNT.email);
          setPassword(SAMPLE_PASSWORD);
          setEmailError("");
          setPasswordError("");
          setFormError("");
        }}
      />
      <Meta>Fills the form. Sign in still has to be pressed.</Meta>
      <QuietButton label="Browse the public record" href="/" />
    </SignInFrame>
  );
}
