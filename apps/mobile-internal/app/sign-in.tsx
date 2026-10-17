import { router } from "expo-router";
import { useRef, useState } from "react";
import { TextInput } from "react-native";

import {
  Field,
  FormError,
  PrimaryButton,
  SectionSub,
  SectionTitle,
  SignInFrame,
} from "@/src/kit";
import { useSession } from "@/src/session";

export default function SignInScreen() {
  const { signIn } = useSession();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  async function submit() {
    const nextEmailError = email.includes("@") ? "" : "Enter a work email.";
    const nextPasswordError = password ? "" : "Enter the password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");
    if (nextEmailError || nextPasswordError) return;
    const message = await signIn(email, password);
    if (message) {
      setFormError(message);
      return;
    }
    router.replace("/");
  }

  return (
    <SignInFrame product="Procurement desk">
      <SectionTitle>Sign in</SectionTitle>
      <SectionSub>Use your work email.</SectionSub>
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
        onSubmitEditing={() => void submit()}
      />
      {formError ? <FormError>{formError}</FormError> : null}
      <PrimaryButton label="Sign in" onPress={() => void submit()} />
    </SignInFrame>
  );
}
