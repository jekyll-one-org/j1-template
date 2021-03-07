module J1App
  class Commands

    FILES = %w(Rakefile config.ru .gitignore).freeze
    VARS  = %w(client_id client_secret team_id org_name).freeze

    def self.execute_command(*args)
      output, status = Open3.capture2e(*args)
      raise "Command `#{args.join(" ")}` failed: #{output}" unless status.exitstatus.zero?
      output
    end

    def self.env_var_set?(var)
      !ENV[var].to_s.blank?
    end

  end
end
