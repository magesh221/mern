module.exports = {
  apps : [{
    script: 'server.js',
    watch: true,
    env:{
      NODE_ENV:'local',
      PORT:8080,
      ATLAS :"mongodb+srv://codemaddy47:a4RBnetYLTP2tBEY@cluster0.nvdqygb.mongodb.net/projectdemo",

    }
  }
],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
