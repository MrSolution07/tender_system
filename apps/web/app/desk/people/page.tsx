"use client";

import { APP_ROLES, type AppRole } from "@tender/shared";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  changePersonRole,
  invitePerson,
  listPeople,
  setPersonAccess,
  type Person,
} from "@/lib/admin";
import { ROLE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store";

export default function PeoplePage() {
  const { session } = useStore();
  const [people, setPeople] = useState<Person[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  function refresh() {
    return listPeople().then((result) => {
      setMessage(result.error);
      if (!result.error) setPeople(result.people);
    });
  }

  useEffect(() => {
    if (session?.role !== "super_admin") return;
    void listPeople().then((result) => {
      setMessage(result.error);
      if (!result.error) setPeople(result.people);
    });
  }, [session?.role]);

  if (session?.role !== "super_admin") {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold">People</h1>
        <p className="mt-3 text-muted-foreground">This desk is for a super admin.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">People</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Create an account and set its role. The password is shown once. Role changes stay with a super admin.
      </p>
      <InviteForm
        onDone={async (error, password) => {
          setCreatedPassword(error ? null : password);
          setMessage(error);
          if (!error) await refresh();
        }}
      />
      {createdPassword ? (
        <Alert className="mt-4">
          <AlertTitle>Account created</AlertTitle>
          <AlertDescription>
            Give them this password once: {createdPassword}. It is not stored in the audit log.
          </AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="mt-4">
          <AlertTitle>People</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {people.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            onDone={async (error) => {
              setCreatedPassword(null);
              setMessage(error);
              if (!error) await refresh();
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function InviteForm({
  onDone,
}: {
  onDone: (error: string | null, password: string) => Promise<void>;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("procurement_officer");
  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-8 grid max-w-lg gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (password.length < 6) {
          void onDone("Password must be at least 6 characters.", "");
          return;
        }
        if (role === "contractor" && !companyName.trim()) {
          void onDone("A contractor needs a company name.", "");
          return;
        }
        setBusy(true);
        void invitePerson({
          fullName,
          email,
          department,
          password,
          role,
          companyName,
          registrationNumber,
        }).then(async (result) => {
          setBusy(false);
          if (!result.error) {
            setFullName("");
            setEmail("");
            setPassword("");
            setCompanyName("");
            setRegistrationNumber("");
          }
          await onDone(result.error, password);
        });
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="person-name">Name</Label>
        <Input id="person-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="person-email">Email</Label>
        <Input id="person-email" type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="person-department">Department</Label>
        <Input id="person-department" value={department} onChange={(event) => setDepartment(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="person-password">Initial password</Label>
        <Input id="person-password" type="text" autoComplete="off" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="person-role">Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
          <SelectTrigger id="person-role" className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APP_ROLES.map((item) => (
              <SelectItem key={item} value={item}>
                {ROLE_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {role === "contractor" ? (
        <>
          <div className="grid gap-2">
            <Label htmlFor="company-name">Company</Label>
            <Input id="company-name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="registration">Registration number</Label>
            <Input id="registration" value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} />
          </div>
        </>
      ) : null}
      <Button type="submit" className="h-11 w-fit" disabled={busy}>
        {busy ? "Creating" : "Create account"}
      </Button>
    </form>
  );
}

function PersonRow({
  person,
  onDone,
}: {
  person: Person;
  onDone: (error: string | null) => Promise<void>;
}) {
  const [role, setRole] = useState<AppRole>(person.role);
  const [companyName, setCompanyName] = useState(person.companyName);

  return (
    <li className="grid gap-3 py-4">
      <div>
        <p className="font-medium">{person.fullName}</p>
        <p className="text-sm text-muted-foreground">
          {person.email} · {ROLE_LABEL[person.role]}
          {person.disabled ? " · Disabled" : ""}
          {person.companyName ? ` · ${person.companyName}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-2">
          <Label htmlFor={`role-${person.id}`}>Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
            <SelectTrigger id={`role-${person.id}`} className="h-11 w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_ROLES.map((item) => (
                <SelectItem key={item} value={item}>
                  {ROLE_LABEL[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role === "contractor" ? (
          <Input
            aria-label="Company"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Company"
            className="h-11 w-56"
          />
        ) : null}
        <Button
          type="button"
          className="h-11"
          onClick={() => {
            void changePersonRole({
              userId: person.id,
              role,
              companyName,
              registrationNumber: person.registrationNumber,
            }).then((result) => onDone(result.error));
          }}
        >
          Save role
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => {
            void setPersonAccess(person.id, !person.disabled).then((result) => onDone(result.error));
          }}
        >
          {person.disabled ? "Enable" : "Disable"}
        </Button>
      </div>
    </li>
  );
}
