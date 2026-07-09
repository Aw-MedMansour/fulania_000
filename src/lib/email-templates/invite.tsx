import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  BrandHeader,
  BrandFooter,
  sharedStyles,
} from "./brand-shared";

interface InviteEmailProps {
  siteName: string;
  siteUrl: string;
  confirmationUrl: string;
}

export const InviteEmail = ({
  siteName = "FulanIA",
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Vous avez été invité à rejoindre {siteName}</Preview>
    <Body style={sharedStyles.main}>
      <Container style={sharedStyles.container}>
        <BrandHeader siteName={siteName} />
        <Section style={sharedStyles.contentSection}>
          <Heading style={sharedStyles.h1}>Vous avez été invité</Heading>
          <Text style={sharedStyles.text}>
            Vous avez été invité à rejoindre{" "}
            <Link href={siteUrl} style={sharedStyles.link}>
              <strong>{siteName}</strong>
            </Link>
            . Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte.
          </Text>
          <Button style={sharedStyles.button} href={confirmationUrl}>
            Accepter l'invitation
          </Button>
          <Text style={sharedStyles.text}>
            Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
);

export default InviteEmail;
