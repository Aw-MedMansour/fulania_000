import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  BrandHeader,
  BrandFooter,
  sharedStyles,
} from "./brand-shared";

interface ReauthenticationEmailProps {
  token: string;
  siteName?: string;
}

export const ReauthenticationEmail = ({ token, siteName = "FulanIA" }: ReauthenticationEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre code de vérification {siteName}</Preview>
    <Body style={sharedStyles.main}>
      <Container style={sharedStyles.container}>
        <BrandHeader siteName={siteName} />
        <Section style={sharedStyles.contentSection}>
          <Heading style={sharedStyles.h1}>Confirmez votre identité</Heading>
          <Text style={sharedStyles.text}>Utilisez le code ci-dessous pour confirmer votre identité :</Text>
          <Text style={sharedStyles.codeStyle}>{token}</Text>
          <Text style={sharedStyles.text}>
            Ce code expirera sous peu. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email en toute sécurité.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
);

export default ReauthenticationEmail;
