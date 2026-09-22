export default function Legal({ privacy = false }) {
  return (
    <main className="portal portal-narrow">
      <h1>{privacy ? "Privacy policy" : "Terms & conditions"}</h1>
      {privacy ? (
        <>
          <h2>Project access</h2>
          <p>
            The studio stores project details, prices, recipient emails and
            uploaded photos or videos to deliver your work. Only permitted
            recipients and authorised studio staff can access your project.
          </p>
          <h2>Public sharing</h2>
          <p>
            Projects are private by default. The project owner may allow
            selected files to appear in the public portfolio and may withdraw
            that permission. Previously downloaded or copied files cannot be
            recalled. New file requests check current access permission.
          </p>
          <h2>Email and providers</h2>
          <p>
            We send verification codes, project invitations and delivery
            notices. Our hosting, database, storage and email providers process
            the data needed to provide these services. Contact the studio
            through the contact page to request correction or deletion, or
            discuss project retention.
          </p>
        </>
      ) : (
        <>
          <h2>Your project</h2>
          <p>
            The studio supplies the project description and agreed price. The
            scope, delivery date, payment and cancellation terms are agreed with
            the studio separately. The website does not take payments.
          </p>
          <h2>Permitted access</h2>
          <p>
            Use an email registered for your project. Do not share sign-in codes
            or use another person’s inbox. Project owners are responsible for
            choosing their permitted recipients.
          </p>
          <h2>Media use</h2>
          <p>
            Downloading files does not change the usage rights agreed with the
            studio. Keep copies of delivered files and contact the studio about
            any delivery issues.
          </p>
        </>
      )}
    </main>
  );
}
