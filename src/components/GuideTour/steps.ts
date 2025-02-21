import { Step } from "react-joyride";

export const appMenuSteps: Step[] = [
  
  {
    target: ".home_button", 
    content: "Home page, the landing page",
  },
  {
    target: ".catalogue_button", 
    content: "Catalogue page has a table displaying the datasets catalogue",
  },
  {
    target: ".publications_button", 
    content: "Publications, these show some of the publication generated from the data",
  },
  {
    target: ".data_access_button", 
    content: "View all the datasets you have access to with some information about your request status",
  },
  {
    target: ".guide_button", 
    content: "This page contains the guide to use this platform.",
  },
  {
    target: ".auth_button", 
    content: "On click of this button, you are directed to a page  where you can register, login",
  },

];

export const catalogueSteps: Step[] = [
  {
    target: ".export_button", 
    content: "Button to download this catalogue",
  },
  // {
  //   target: ".external_dataset_button", 
  //   content: "This is in case you have a dataset you would like to be added to the data warehouse",
  // },
  {
    target: ".menu_view", 
    content: "Helps you filter through the datasets",
  },
]

export const dataAccessPage: Step[] = [
  {
    target: ".show_trends_button", 
    content: "Have a look at some of the graphs produced from the data",
  },
  {
    target: ".data_access_table", 
    content: "Here, you can see all datasets and your access level, click on any to download or request",
  },
 
]