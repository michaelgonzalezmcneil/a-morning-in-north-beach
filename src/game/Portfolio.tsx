import { portfolio } from "./config";
export function PortfolioContent({
  section = "all",
}: {
  section?: "all" | "about" | "projects" | "contact";
}) {
  return (
    <>
      {(section === "all" || section === "about") && (
        <section id="about">
          <p className="nb-kicker">A LITTLE ABOUT ME</p>
          <h2>Michael Gonzalez McNeil</h2>
          <p>
            I spent an internship summer in San Francisco, and visited Caffè
            Trieste, City Lights, Vesuvio / Jack Kerouac Alley, and Telegraph
            Hill. This little neighborhood is a way to share that connection to
            the city.
          </p>
          <p>
            Bella is my long-haired Chihuahua. Here, she joins me on an imagined
            morning walk.
          </p>
          <p className="nb-note">
            More biography, education, and professional experience can be added
            when verified details are available.
          </p>
        </section>
      )}
      {(section === "all" || section === "projects") && (
        <section id="projects">
          <p className="nb-kicker">THINGS YOU CAN EXPLORE</p>
          <h2>Small worlds, made for the web.</h2>
          <article className="nb-project">
            <span>01 / INTERACTIVE EXPERIENCE</span>
            <h3>A Morning in North Beach</h3>
            <p>
              The portfolio you’re visiting: original pixel art, a walkable
              neighborhood, four interiors, and a companion who follows the
              paths you take.
            </p>
            <p className="nb-tags">TypeScript · React · Phaser · Vite</p>
          </article>
          <article className="nb-project">
            <span>02 / EXISTING PROJECT</span>
            <h3>RiceWalk & the interactive campus</h3>
            <p>
              Explore the existing Rice walking experience and its playable
              campus. Route times and media in RiceWalk are demonstration
              content.
            </p>
            <p className="nb-note">
              Preserved in Michael’s separate RiceWalk workspace. A public
              project link has not been supplied.
            </p>
          </article>
        </section>
      )}
      {(section === "all" || section === "contact") && (
        <section id="contact">
          <p className="nb-kicker">KEEP IN TOUCH</p>
          <h2>Let’s start a conversation.</h2>
          <p>
            For current experience, project background, or simply to say hello:
          </p>
          <a className="nb-email" href={`mailto:${portfolio.email}`}>
            {portfolio.email} ↗
          </a>
          {portfolio.links
            .filter((l) => /^https:\/\//.test(l.href))
            .map((l) => (
              <p key={l.href}>
                <a href={l.href}>{l.label} ↗</a>
              </p>
            ))}
        </section>
      )}
    </>
  );
}
