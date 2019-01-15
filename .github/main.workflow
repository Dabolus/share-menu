workflow "Lint, Test and Build" {
  on = "push"
  resolves = [
    "Lint",
    "Test",
    "Build",
  ]
}

action "Install" {
  uses = "borales/actions-yarn@master"
  args = "install"
}

action "Lint" {
  needs = "Install"
  uses = "borales/actions-yarn@master"
  args = "lint"
}

action "Test" {
  needs = "Install"
  uses = "borales/actions-yarn@master"
  args = "test"
}

action "Build" {
  needs = "Install"
  uses = "borales/actions-yarn@master"
  args = "build"
}
