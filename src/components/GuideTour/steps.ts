import { Step } from "react-joyride";

type AppMenuOptions = {
  isLoggedIn?: boolean;
  isMobile?: boolean;
};

/**
 * The desktop nav links are hidden below 861px (and the mobile ones live inside a
 * closed dropdown), so on small screens we only walk through targets that are
 * actually on screen. Step 1 is always the centred welcome card so the tour never
 * opens on a missing target.
 */
export const getAppMenuSteps = ({
  isLoggedIn = false,
  isMobile = false,
}: AppMenuOptions = {}): Step[] => {
  const welcome: Step = {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to AMRDB",
    content:
      "A quick tour of the portal — where to find datasets, how to request access, and what else you can do here. It takes less than a minute.",
  };

  const accountSteps: Step[] = [
    {
      target: ".guide_button",
      title: "Guide",
      content:
        "The full user guide: how the portal works, access levels, and how your data request is reviewed.",
    },
    isLoggedIn
      ? {
          target: ".profile_button",
          title: "Your profile",
          content:
            "Your account, organisation details and the requests you have made. Update your details here to speed up approvals.",
        }
      : {
          target: ".auth_button",
          title: "Sign in or register",
          content:
            "Create an account or log in. An account is what lets you request access to datasets and use the ML models.",
        },
  ];

  if (isMobile) {
    return [
      welcome,
      {
        target: ".menu_button",
        title: "The main menu",
        content:
          "Tap here for the Catalogue, Access, Models, Publications and Contribute pages.",
      },
      ...accountSteps,
    ];
  }

  return [
    welcome,
    {
      target: ".catalogue_button",
      title: "Dataset catalogue",
      content:
        "Browse every dataset in the warehouse, filter by pathogen, site or year, and export the catalogue.",
    },
    {
      target: ".data_access_button",
      title: "Data access",
      content:
        "See what you already have access to, track the status of pending requests, and download approved datasets.",
    },
    {
      target: ".models_button",
      title: "Models",
      content:
        "Explore the AMR prediction and analysis models built on the warehouse data, and run them against supported inputs.",
    },
    {
      target: ".publications_button",
      title: "Publications",
      content:
        "Papers and reports generated from this data — useful context before you request a dataset.",
    },
    {
      target: ".contribute_button",
      title: "Contribute a dataset",
      content:
        "Have data of your own? Submit it here and our team will review it for inclusion in the data lake house.",
    },
    ...accountSteps,
  ];
};

/** Kept for backwards compatibility with any direct imports. */
export const appMenuSteps: Step[] = getAppMenuSteps();

export const catalogueSteps: Step[] = [
  {
    target: ".export_button",
    title: "Export",
    content: "Download the catalogue you are currently viewing as a file.",
  },
  {
    target: ".menu_view",
    title: "Filters",
    content:
      "Narrow the catalogue down by the fields that matter to you — the table updates as you filter.",
  },
];

export const dataAccessPage: Step[] = [
  {
    target: ".show_trends_button",
    title: "Trends",
    content: "Have a look at some of the graphs produced from the data.",
  },
  {
    target: ".data_access_table",
    title: "Your datasets",
    content:
      "Every dataset with your access level against it — click any row to download it or to raise a request.",
  },
];
