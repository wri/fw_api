variable "project_prefix" {
  type = string
  default = "fw-api"
}

variable "environment" {
  type        = string
  description = "An environment namespace for the infrastructure."
}

variable "region" {
  default = "us-east-1"
  type    = string
}

variable "container_port" {
  default = 80
  type    = number
}
variable "logger_level" {
  type = string
}
variable "log_retention" {
  type    = number
  default = 30
}
variable "desired_count" {
  type = number
}
variable "fargate_cpu" {
  type    = number
  default = 256
}
variable "fargate_memory" {
  type    = number
  default = 512
}
variable "auto_scaling_cooldown" {
  type    = number
  default = 300
}
variable "auto_scaling_max_capacity" {
  type = number
}
variable "auto_scaling_max_cpu_util" {
  type    = number
  default = 75
}
variable "auto_scaling_min_capacity" {
  type = number
}

variable "git_sha" {
  type = string
}
variable "node_env" {
  type    = string
  default = "dev"
}
variable "suppress_no_config_warning" {
  type    = string
  default = "true"
}
variable "control_tower_url" {
  type    = string
  default = "https://api.resourcewatch.org"
}
variable "areas_api_url" {
  type    = string
  default = "https://api.resourcewatch.org/v1"
}
variable "rw_areas_api_url" {
  type    = string
  default = "https://api.resourcewatch.org/v2"
}
variable "geostore_api_url" {
  type    = string
  default = "https://api.resourcewatch.org/v1"
}
variable "forms_api_url" {
  type    = string
  default = "https://api.resourcewatch.org/v1"
}
variable "teams_api_url" {
  type    = string
  default = "https://api.resourcewatch.org/v1"
}
variable "api_version" {
  type    = string
  default = "v1"
}
variable "healthcheck_path" {
  type = string
}

variable "healthcheck_sns_emails" {
  type = list(string)
}
