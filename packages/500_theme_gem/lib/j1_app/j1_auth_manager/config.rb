module J1App

  # set j1 project path
  #
  def self.project_path
    # set project folder to the path set by ENV var J1_PROJECT_HOME (preferred)
    #
    if ENV['J1_PROJECT_HOME'] != nil
      ENV['J1_PROJECT_HOME']
    elsif ARGV.grep(/config.ru/)[0] != nil
      # set project folder to path of ARGV argument for config.ru if available.
      # This will work, if the app is called from commandline (rackup)
      #
      File.dirname(ARGV.grep(/config.ru/)[0])
    else
      # set project folder if app is called from application manager
      # (e.g. passenger) to current work dir
      # NOTE:
      #   Unclear why File.join resolves the PATH correctly
      #   but File.dirname doesn't:
      #     File.dirname(Dir.pwd)
      #
      File.join(Dir.pwd, "")
    end
  end

  def self.jekyll_config_file
    # File.join(Dir.pwd, "_config.develop.yml")
    # File.join(Dir.pwd, '_config.yml')
    File.join(J1App.project_path, '_config.yml')
  end

  def self.jekyll_config
    @config ||= YAML.safe_load_file(jekyll_config_file)
  rescue StandardError
    {}
  end

  def self.auth_config_file
    # File.join(Dir.pwd, '_data/modules/authentication.yml')
    File.join(J1App.project_path, '_data/modules/authentication.yml')
  end

  def self.auth_config_data
    @auth ||= YAML.safe_load_file(auth_config_file)
  rescue StandardError
    {}
  end

  def self.template_config_file
    # File.join(Dir.pwd, '_data/j1_config.yml')
    File.join(J1App.project_path, '_data/j1_config.yml')
  end

  def self.template_config
    @template_config ||= YAML.safe_load_file(template_config_file)
  rescue StandardError
    {}
  end

  def self.template_private_data_file
    # File.join(Dir.pwd, '_data/private.yml')
    File.join(J1App.project_path, '_data/private.yml')
  end

  def self.private_data
    @private_data ||= YAML.safe_load_file(template_private_data_file)
  rescue StandardError
    {}
  end

  def self.middleware_data
    private_data.fetch('middleware', {})
  end

  def self.oauth_data
    middleware_data.fetch('oauth', {})
  end

  def self.destination
    # jekyll_config.fetch('destination', File.expand_path('_site', Dir.pwd))
    jekyll_config.fetch('destination', File.expand_path(J1App.project_path, '_site'))
  end

  def self.auth_settings
    auth_config_data.fetch('settings', {})
  end

  def self.auth_config
    # @auth['settings']['j1_auth']
    auth_settings['j1_auth']
  end

  def self.user_settings
    template_config.fetch('user', {})
  end

  def self.auth?
    !!auth_config['enabled']
  end

  def self.ssl?
    !!auth_config['ssl']
  end

  def self.whitelist
    whitelist = auth_config['whitelist']
    Regexp.new(whitelist.join("|")) unless whitelist.nil?
  end

  def self.public_content
    public_content = auth_config['content']['public']
    Regexp.new(public_content.join("|")) unless public_content.nil?
  end

  def self.active_providers
    auth_config['providers']['activated']
  end

  def self.default_provider
    auth_config['providers']['activated'][0]
  end

  def self.permissions
    permission_profile = {
        :protected   => [],
        :private   => []
    }

    active_providers = auth_config['providers']['activated']

    active_providers.each { |p|
      provider_permissions = auth_config['providers']["#{p}"]['permissions']
      provider_permissions.each do |perm|
        permission_profile[:"#{perm}"] << "#{p}"
      end
    }
    permission_profile
  end

  def self.get_condition(arg)
    auth_config['provider']['condition']["#{arg}"]
  end

  def self.conditions (arg)
    condition_profile = {}
    provider = arg
    provider_conditions = auth_config['providers']["#{provider}"]['conditions']
    provider_conditions.each do |key, value|
      condition_profile[key] = value
    end
    condition_profile
  end

  class ConfigError < RuntimeError
    def message
      "J1App is refusing to serve your site because your OAuth credentials are not properly configured"
    end
  end

  # def self.provider_url(arg)
  #   provider_url = {
  #     'patreon'   => auth_config['provider']['provider_url']['patreon'],
  #     'disqus'    => auth_config['provider']['provider_url']['disqus'],
  #     'facebook'  => auth_config['provider']['provider_url']['facebook'],
  #     'github'    => auth_config['provider']['provider_url']['github'],
  #     'twitter'   => auth_config['provider']['provider_url']['twitter']
  #   }
  #   provider_url[arg]
  # end

  # def self.provider_scope(arg)
  #   provider_scope = {
  #     'patreon'   => auth_config['provider']['scope']['patreon'],
  #     'disqus'    => auth_config['provider']['scope']['disqus'],
  #     'facebook'  => auth_config['provider']['scope']['facebook'],
  #     'github'    => auth_config['provider']['scope']['github'],
  #     'twitter'   => auth_config['provider']['scope']['twitter']
  #   }
  #   provider_scope[arg].join(',')
  # end

  # def self.provider_data(arg)
  #   provider_data = {
  #       'patreon'   => auth_config['provider']['data']['patreon'],
  #       'disqus'    => auth_config['provider']['data']['disqus'],
  #       'facebook'  => auth_config['provider']['data']['facebook'],
  #       'github'    => auth_config['provider']['data']['github'],
  #       'twitter'   => auth_config['provider']['data']['twitter']
  #   }
  #   provider_data[arg].join(',')
  # end

  # def self.provider_condition(arg)
  #   provider_condition = {
  #       'patreon'   => auth_config['provider']['condition']['patreon'],
  #       'disqus'    => auth_config['provider']['condition']['disqus'],
  #       'facebook'  => auth_config['provider']['condition']['facebook'],
  #       'github'    => auth_config['provider']['condition']['github'],
  #       'twitter'   => auth_config['provider']['condition']['twitter']
  #   }
  #   provider_condition[arg]
  # end

  # def self.permissions_old
  #   permission_profile = {
  #       :protected   => [],
  #       :private   => []
  #   }
  #
  #   provider_permissions = auth_config['provider']['permission']
  #   provider_permissions.each do |key, value|
  #     my_key = key
  #     value.each { |perm| permission_profile[:"#{perm}"] << key }
  #   end
  #   permission_profile
  # end

  # def self.get_provider_permissions (arg)
  #   auth_config['provider']['permission']["#{arg}"].join(',')
  # end

  # def self.users
  #   user_profile = {}
  #
  #   provider_users = auth_config['provider']['user']
  #   provider_users.each do |key, value|
  #     user_profile[key] = value
  #   end
  #   user_profile
  # end

  # def self.strategies
  #   strategy_profile = {}
  #
  #   provider_strategies = auth_config['provider']['strategy']
  #   provider_strategies.each do |key, value|
  #     strategy_profile[key] = :"#{value}"
  #   end
  #   strategy_profile
  # end

end
