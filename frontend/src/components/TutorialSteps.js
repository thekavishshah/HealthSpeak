export function createTutorialSteps({
  searchRef,
  historyRef,
  relatedTermsRef,
  logoutRef,
}) {
  return [
    {
      targetRef: searchRef,
      title: "Search here",
      text: "Type symptoms or medical terms to get started.",
      placement: "bottom",
    },
    {
      targetRef: historyRef,
      title: "Chat history",
      text: "View your previous searches here.",
      placement: "right",
    },
    {
      targetRef: relatedTermsRef,
      title: "Related terms",
      text: "Click these to explore similar medical terms.",
      placement: "bottom",
    },
    {
      targetRef: logoutRef,
      title: "Logout",
      text: "Click here to safely log out.",
      placement: "left",
    },
  ];
}