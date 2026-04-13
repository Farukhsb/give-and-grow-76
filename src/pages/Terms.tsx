import Layout from "@/components/Layout";

const Terms = () => (
  <Layout>
    <div className="container py-16">
      <h1 className="font-serif text-4xl font-bold">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 13, 2026</p>
      <div className="mt-8 max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Acceptance of Terms</h2><p>By accessing and using CharityApp, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">User Accounts</h2><p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to update it as necessary. CharityApp reserves the right to suspend accounts that violate these terms.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Donations</h2><p>Donations are processed through a third-party payment provider. A donation is only considered complete after the provider confirms payment to our backend. Pending or cancelled checkout sessions do not create completed donations.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Intellectual Property</h2><p>All content on CharityApp, including text, graphics, logos, and software, is the property of CharityApp or its licensors and is protected by intellectual property laws.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Limitation of Liability</h2><p>CharityApp is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p></section>
      </div>
    </div>
  </Layout>
);

export default Terms;
