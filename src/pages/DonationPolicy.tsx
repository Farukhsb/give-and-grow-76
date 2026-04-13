import Layout from "@/components/Layout";

const DonationPolicy = () => (
  <Layout>
    <div className="container py-16">
      <h1 className="font-serif text-4xl font-bold">Donation Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 13, 2026</p>
      <div className="mt-8 max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">How Donations Are Processed</h2><p>The current app experience records demo pledges only. A verified payment processor and server-side confirmation flow must be connected before donations can be treated as completed payments.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Tax Receipts</h2><p>Demo pledges do not generate official tax receipts. Tax documents should only be issued after a real payment flow is implemented and the donation is verified.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Recurring Donations</h2><p>Recurring donations are not enabled in the current build. They should remain unavailable until verified payments and cancellation controls are implemented server-side.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Refund Policy</h2><p>Because the current donation flow stores demo pledges only, no payment is captured and no refund workflow is active. Refund language should be revisited once a payment processor is connected.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Charity Verification</h2><p>All charities on CharityApp are verified nonprofits. We conduct regular audits to ensure funds are used appropriately. If a charity is removed from our platform, any remaining funds will be redirected to similar causes with donor notification.</p></section>
      </div>
    </div>
  </Layout>
);

export default DonationPolicy;
