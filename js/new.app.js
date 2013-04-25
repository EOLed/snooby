App = Ember.Application.create();

App.Router.map(function() {
  this.resource('subreddits', function() {
    this.route('posts', { path: ':subreddit_id/posts' });
  });
});

App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.FixtureAdapter
});

App.MyFixtureAdapter = DS.FixtureAdapter.extend({
});

App.Post = DS.Model.extend({
  domain: DS.attr('string'),
  subreddit: DS.attr('string'),
  selfText: DS.attr('string'),
  likes: DS.attr('boolean'),
  linkFlairText: DS.attr('string'),
  clicked: DS.attr('boolean'),
  title: DS.attr('string'),
  score: DS.attr('number'),
  over18: DS.attr('boolean'),
  hidden: DS.attr('boolean'),
  thumbnail: DS.attr('string'),
  edited: DS.attr('boolean'),
  linkFlairCssClass: DS.attr('string'),
  authorFlairCssClass: DS.attr('string'),
  downs: DS.attr('number'),
  isSelf: DS.attr('boolean'),
  permalink: DS.attr('string'),
  name: DS.attr('string'),
  url: DS.attr('string'),
  authorFlairText: DS.attr('string'),
  author: DS.attr('string'),
  createdUtc: DS.attr('number'),
  ups: DS.attr('number'),
  numComments: DS.attr('number')
});

App.Subreddit = DS.Model.extend({
  name: DS.attr('string'),
  title: DS.attr('string'),
  url: DS.attr('string'),
  displayName: DS.attr('string'),
  description: DS.attr('string'),
  over18: DS.attr('boolean'),
  createdUtc: DS.attr('number'), 
  subscribers: DS.attr('number')
});

App.SubredditsRoute = Ember.Route.extend({
  model: function() {
    return App.Subreddit.find();
  } 
});

App.SubredditsPostsRoute = Ember.Route.extend({
  model: function() {
    return App.Post.find();
  },

  renderTemplate: function() {
    this.render('subreddits.posts', { into: 'application' });
  }
});

App.Subreddit.FIXTURES = [{
  id: "funny",
  url: "/r/funny/",
  createdUtc: 1201242956,
  description: "/r/funny will be going private to raise awareness for CISPA. [There will be an informational/discussion thread open](http://www.reddit.com/r/Stand/comments/1cufnx/official_unofficial_cispa_discussion_thread/) for all comments, questions, and concerns.",
  over18: false,
  subscribers: 3633873,
  displayName: "funny",
  name: "t5_2qh33"
}, {
  id: "AskReddit",
  url: "/r/AskReddit/",
  createdUtc: 1201233135,
  description: "/r/AskReddit is the place to be to ask thought-provoking questions.",
  over18: false,
  subscribers: 3382214,
  displayName: "AskReddit",
  name: "t5_2qh1i"
}, {
  id: "todayilearned",
  url: "/r/todayilearned/",
  createdUtc: 1230446819,
  description: "You learn something new every day; what did you learn today? Submit interesting and specific facts about something that you just found out here.",
  over18: false,
  subscribers: 3238573,
  displayName: "todayilearned",
  name: "t5_2qqjc"
} , {
  id: "frontpage",
  url: "/",
  createdUtc: 1230446819,
  description: "Front page of the internet.",
  over18: false,
  subscribers: 3238573,
  displayName: "frontpage",
  name: "t5_frntpg"
}];
