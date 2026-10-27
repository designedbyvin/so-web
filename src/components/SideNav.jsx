import Icon from "./Icon.jsx";

// White Sō wordmark with the amber block, for the maroon brand block at the top of the rail.
function Wordmark() {
  return (
    <svg viewBox="160 264 704 496" role="img" aria-label="Sō">
      <path fill="#FFFFFF" d="M180.56 611.97L298.27 611.97Q299.96 632.81 310.66 642.38Q321.36 651.96 338.25 651.96Q353.46 651.96 363.32 644.35Q373.17 636.75 373.17 623.23Q373.17 605.77 356.84 596.20Q340.51 586.62 303.90 574.80Q265.04 561.84 241.10 549.73Q217.16 537.63 199.42 514.25Q181.68 490.88 181.68 453.15Q181.68 414.85 200.83 387.53Q219.98 360.22 253.77 346.14Q287.56 332.06 330.37 332.06Q399.64 332.06 441.04 364.44Q482.43 396.83 485.25 455.40L365.29 455.40Q364.72 437.38 354.30 428.36Q343.88 419.35 327.55 419.35Q315.16 419.35 307.28 426.68Q299.39 434.00 299.39 447.51Q299.39 458.78 308.12 466.94Q316.85 475.11 329.80 481.02Q342.76 486.94 368.10 495.95Q405.84 508.90 430.34 521.57Q454.84 534.25 472.58 557.06Q490.32 579.87 490.32 614.78Q490.32 650.27 472.58 678.43Q454.84 706.59 421.32 722.92Q387.81 739.25 342.20 739.25Q272.92 739.25 228.43 706.30Q183.94 673.36 180.56 611.97Z" />
      <path fill="#FFFFFF" d="M512.28 577.05Q512.28 528.05 533.96 491.44Q555.65 454.84 593.10 435.12Q630.55 415.41 677.86 415.41Q725.17 415.41 762.62 435.12Q800.08 454.84 821.76 491.44Q843.44 528.05 843.44 577.05Q843.44 626.05 821.76 662.94Q800.08 699.83 762.34 719.54Q724.61 739.25 677.30 739.25Q629.99 739.25 592.54 719.54Q555.08 699.83 533.68 663.22Q512.28 626.61 512.28 577.05ZM731.37 577.05Q731.37 544.95 715.88 528.05Q700.39 511.16 677.86 511.16Q655.33 511.16 640.13 528.05Q624.92 544.95 624.92 577.05Q624.92 609.72 639.56 626.61Q654.21 643.51 677.30 643.51Q700.39 643.51 715.88 626.33Q731.37 609.15 731.37 577.05Z" />
      <path fill="#FFFFFF" d="M541 363.6h253.44a19.71 19.71 0 0 1 0 39.42H541a19.71 19.71 0 0 1 0-39.42Z" />
      <path fill="#F5A524" d="M752.2 284.75h45.06a16.9 16.9 0 0 1 16.9 16.9v45.05a16.9 16.9 0 0 1-16.9 16.9H752.2a16.9 16.9 0 0 1-16.89-16.9v-45.05a16.9 16.9 0 0 1 16.89-16.9Z" />
    </svg>
  );
}

function Item({ icon, label, active, onClick }) {
  return (
    <button className="nav-item" title={label} aria-label={label} aria-current={active ? "page" : undefined} onClick={onClick}>
      <Icon name={icon} />
    </button>
  );
}

/** The 64px icon rail: Home and Projects at the top, Settings at the bottom. */
export default function SideNav({ active, onNavigate }) {
  return (
    <nav className="nav" aria-label="Main">
      <button className="nav-brand" onClick={() => onNavigate("home")} aria-label="Sō home"><Wordmark /></button>
      <ul className="nav-list">
        <li><Item icon="home" label="Home" active={active === "home"} onClick={() => onNavigate("home")} /></li>
        <li><Item icon="layers" label="Projects" active={active === "projects"} onClick={() => onNavigate("projects")} /></li>
      </ul>
      <div className="nav-foot">
        <Item icon="sliders" label="Settings" active={active === "settings"} onClick={() => onNavigate("settings")} />
      </div>
    </nav>
  );
}
