variable "VULTR_API_KEY" {
  type = string
}

provider "vultr" {
  api_key = var.VULTR_API_KEY
}

resource "vultr_ssh_key" "mbp_ssh_key" {
  name    = "mbp_ssh_key"
  ssh_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD4HSopKnt3WYjiYIQrdDzI6oFKI4tVYlDsHDMxlLeiSK9WphClmR0TaIXclxuxON/SD+34qeynM/sBkWNMTJA17I2uzWLjq2Tp+iR3Ro3OtmnQyXtjILvj63u397XgmQWyssZZozDeHnFOVMVpB63E4xaiP608bkc6NDEAGwXkShjaaZN5dNqr+2UAtgVMItfkjedd6FPqzFEp705Sll3XtXfomC2EoMOQy/U9iuZoJ0xAZOM0VSJSmY6WVWiq3u1B6xHtsYw0ptFZCoefmbVMyi7HxYqNKZGIkxAUx8ziSftfazzvdvyOEEVmYvRu+ijmjKhXykW27HDdecXaQ1NE8AoTEUrBoZFdQgwSsYIeY0wKKjru43Rr9NCWf6E9WDLD4EleDKds+bskanTTGqXh7AD1n0oxelLniiNIfzOywT2jVFkYwgqCffivrcAmeZu/BXmuf4ta7W+TpUsD+nV/R/1TWPjyVOW7WtIWD4qRZoW5qKsu8yaBTbGnbLBZ4ZzXKCbampqirZSmJw+gq7EqRd0GuY0InWErrvCgRwa8CITqWc8kmbP8H/BnKTtbcqvzcX1JHaneQjO1xS/87z9YDDc1IOCe0gJFwN+LQOWP5wN1/LHiap+Nez5jpuigD94QnSZhp2OZjCTkjeBWX6Hak6hRlblmyUN3IZnd1JGkPQ== hello@jeff.yt"
}


resource "vultr_server" "apiserver" {
  # 1vcpu, 1g ram, 25g storage, 1t bandwidth
  plan_id = "201"
  # silicon valley
  region_id = "12"
  # ubuntu 20.04
  os_id = "387"

  ssh_key_ids     = [vultr_ssh_key.mbp_ssh_key.id]
  auto_backup     = false
  notify_activate = true
  ddos_protection = false
  label           = "apiserver"
  tag             = "apiserver"
  hostname        = "apiserver"
}

output "apiserver_ip" {
  value = vultr_server.apiserver.main_ip
}
